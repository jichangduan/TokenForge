const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { Black_And_White_Picture } = require("next/font/google")

// describe  把相关的多个测试放在一起  做一个测试套件
describe("Factory", function () {   // title  测试的主题   callback 定义测试内容 通常包含多个it
    
    // 创建token需要支付给factory的手续费
    const FEE = ethers.parseUnits("0.01", 18)

    //fixture  固定装置  统一调用 避免麻
    async function deployFactoryFixture(){
        // fetch accounts
        // console.log(await ethers.getSigners())
        const [ deployer, creator, buyer ] = await ethers.getSigners()
        const Factory = await ethers.getContractFactory("Factory")
        const factory = await Factory.deploy(FEE) //0.01eth 

        // create token  合约调用者临时切换到creator  connect 链接一个ethers.getSigners() 账号
        const transaction = await factory.connect(creator).create("Dapp Uni", "DU", {value: FEE})
        // factory 里面写死了token totallysupply   所以不需要在这里测试
        await transaction.wait()
        
        // get token address
        const tokenAddress = await factory.tokens(0)
        // 获取Token合约
        const token = await ethers.getContractAt("Token", tokenAddress)
            
        return { factory, token , deployer, creator, buyer}
    }

    // fixture 购买token
    async function buyTokenFixture() {
        const { factory, token, buyer, creator} = await deployFactoryFixture()

        const AMOUNT = ethers.parseUnits("10000", 18)
        const COST = ethers.parseUnits("1", 18)

        // Buy tokens
        const transaction = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, {value: COST})
        await transaction.wait();

        return { factory, token, creator, buyer}
    }

    describe("Deployment", function() {
        it("should set the fee", async function () { // title 这个测试的预期行为   callback 实际的测试和断言
            const {factory} = await loadFixture(deployFactoryFixture)
            expect(await factory.fee()).to.equal(FEE)
        })
        
        it("should set the owner", async function () {
            const {factory, deployer} = await loadFixture(deployFactoryFixture)
            expect(await factory.owner()).to.equal(deployer.address)
        })
    })
    
    describe("Creating", function(){
        it("should set the owner",async function() {
            const {factory, token} = await loadFixture(deployFactoryFixture)
            expect(await token.owner()).to.equal(await factory.getAddress())
        } )

        it("Should set the creator", async function () {
            const {token, creator} = await loadFixture(deployFactoryFixture)
            expect(await token.creator()).to.equal(creator.address)
        })

        it("Should set the supply", async function(){
            const {factory, token} = await loadFixture(deployFactoryFixture)

            const totalSupply = ethers.parseUnits("1000000", 18)
            // ethers.js v6 中获取部署在链上的合约地址  代替v5中的 .address 属性
            expect(await token.balanceOf(await factory.getAddress())).to.equal(totalSupply)
        })

        it("Should update ETH balance", async function () {
            const {factory} = await loadFixture(deployFactoryFixture)

            const balance = await ethers.provider.getBalance(await factory.getAddress())

            expect(balance).to.equal(FEE)
        })

        it("Should create the sale", async function () {
            const {factory, token, creator} = await loadFixture(deployFactoryFixture)
            
            const count = await factory.totalTokens()

            expect(count).to.equal(1)

            const sale = await factory.getTokenSale(0)
            //console.log(sale)

            expect(sale.token).to.equal(await token.getAddress())
            expect(sale.creator).to.equal(creator.address)
            expect(sale.sold).to.equal(0)
        })
    })

    describe("Buying", function(){

        const AMOUNT = ethers.parseUnits("10000",18)
        const COST = ethers.parseUnits("1", 18)
        
        // check contract received eth
        it("Should update ETH balance", async function () {
            const {factory} = await loadFixture(buyTokenFixture)

            const balance = await ethers.provider.getBalance(await factory.getAddress() )
            expect(balance).to.equal(FEE + COST)
        })

        //  check that buyer received tokens
        it("Should update token balance", async function () {
            const {token, buyer } =  await loadFixture(buyTokenFixture)

            const balance = await token.balanceOf(buyer.address)
            expect(balance).to.equal(AMOUNT)
        })

        it("Should update token sale", async function () {
            const {factory, token} = await loadFixture(buyTokenFixture)

            const sale = await factory.tokenToSale(await token.getAddress())

            expect(sale.sold).to.equal(AMOUNT)
            expect(sale.raised).to.equal(COST)
            expect(sale.isOpen).to.equal(true)
            
        })

        it("Should increase base cost", async function () {
            const {factory, token} =  await loadFixture(buyTokenFixture)

            const sale = await factory.tokenToSale(await token.getAddress())
            const cost = await factory.getCost(sale.sold)

            expect(cost).to.equal(ethers.parseUnits("0.0002"))
        })

    })

    describe("Depositing", function() {
        const AMOUNT = ethers.parseUnits("10000",18)
        const COST = ethers.parseUnits("2", 18)

        it("Sale should be closed and successfully deposits", async function() {
            const {factory, token, creator, buyer} = await loadFixture(buyTokenFixture)

            //buy tokens again to reach target
            const buyTx = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, {value: COST})
            await buyTx.wait()

            const sale = await factory.tokenToSale(await token.getAddress())
            expect(sale.isOpen).to.equal(false)

            const depositTx = await factory.connect(creator).deposit(await token.getAddress())
            await depositTx.wait()

            const balance = await token.balanceOf(creator.address)
            expect(balance).to.equal(ethers.parseUnits("980000",18))
        })
    })

    describe("Withdrawing Fees", function () {
        it("Should update ETH balance", async function() {
            const { factory, deployer } = await loadFixture(deployFactoryFixture)

            const transaction = await factory.connect(deployer).withdraw(FEE)
            await transaction.wait()

            const balance = await ethers.provider.getBalance(await factory.getAddress())
            expect(balance).to.equal(0)
        })
    })


    // // 每个功能都写测试用例，过于繁琐   所以创建一个抽象的代码
    // it("should have a name", async function () {
    //     // // Fetch the contract
    //     // const Factory = await ethers.getContractFactory("Factory")
    //     // // Deployed the contract
    //     // const factory = await Factory.deploy()   
    //     const { factory } = await deployFactoryFixture() 
    //     // check name
    //     const name = await factory.name()
    //     // name is correct 
    //     // console.log(name)
    //     expect(name).to.equal("Factory")
    // })

    // it("should have another name", async function () {
    //     const { factory } = await deployFactoryFixture()
    //     // check name
    //     const name = await factory.name2()
    //     // name is correct 
    //     // console.log(name)
    //     expect(name).to.equal("Factory2")
    // })
})
