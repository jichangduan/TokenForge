const { ethers } = require("hardhat");

async function main() {
  console.log("准备部署 Factory 合约...");

  // 设置 Factory 的费用参数
  const fee = ethers.parseEther("0.01"); // 0.01 ETH 作为创建费用
  
  // 部署 Factory 合约
  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy(fee);
  await factory.waitForDeployment();
  
  const address = await factory.getAddress();
  console.log("Factory 合约已部署到:", address);
  console.log("费用设置为:", ethers.formatEther(fee), "ETH");
  
  // 将地址保存到配置文件
  const fs = require("fs");
  const config = JSON.parse(fs.readFileSync("./app/config.json"));
  
  // 获取网络ID
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId.toString();
  
  // 更新配置
  config[chainId] = {
    factory: {
      address: address
    }
  };
  
  // 保存更新后的配置
  fs.writeFileSync("./app/config.json", JSON.stringify(config, null, 2));
  console.log("配置文件已更新");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署出错:", error);
    process.exit(1);
  }); 