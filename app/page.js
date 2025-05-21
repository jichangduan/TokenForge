"use client"

import { useEffect, useState } from "react"
import { ethers } from 'ethers'

// Components
import Header from "./components/Header"
import List from "./components/List"
import Token from "./components/Token"
import Trade from "./components/Trade"

// ABIs & Config
import Factory from "./abis/Factory.json"
import config from "./config.json"
import images from "./images.json"

export default function Home() {

  const[provider, setProvider] = useState(null)
  const[account, setAccount] = useState(null)
  const[factory, setFactory] = useState(null)
  const[fee, setFee] = useState(0)
  const[tokens, setTokens] = useState([])
  const[showCreate, setShowCreate] = useState(false)

  function toggleCreate() {
    setShowCreate(!showCreate)
    console.log("Toggle create:", !showCreate)
  }
  
  async function loadBlockchainData() {
    try {
      //使用ethers 链接区块链
      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      const network = await provider.getNetwork()
      console.log("连接到网络:", network.chainId)

      // 检查网络 ID 是否在配置中
      if (!config[network.chainId]) {
        console.error("当前网络未配置:", network.chainId)
        return
      }

      const factory = new ethers.Contract(
        config[network.chainId].factory.address,
        Factory,
        provider
      )
      setFactory(factory)  // 这行很重要，需要设置 factory 状态
      console.log("创建了工厂合约实例")
      
      const fee = await factory.fee()
      console.log("获取到费用:", ethers.formatEther(fee), "ETH")
      setFee(fee)

      const totalTokens = await factory.totalTokens()
      const tokens = []

      for (let i =0; i < 6 ; i++){
        if(i==6){ 
          break
        }
      }

      for(let i=0; i < totalTokens; i++){
        const tokenSale = await factory.getTokenSale(i)
        const token = {
          token: tokenSale.token,
          name: tokenSale.name,
          creator: tokenSale.creator,
          sold: tokenSale.sold,
          image: images[i],
          raised: tokenSale.raised,
          isOpen: tokenSale.isOpen
        }
        tokens.push(token)
      }
      console.log("所有代币:", tokens)
      setTokens(tokens)
    } catch (error) {
      console.error("加载区块链数据出错:", error)
    }
    setTokens(tokens.reverse())
  }

  useEffect(() => {
    loadBlockchainData()
  }, []) 

  return (
    <div className="page">
      <Header account={ account } setAccount={setAccount}/>
      <main>
        <div className="create">
          <button 
            onClick={() => { 
              if (factory && account) toggleCreate() 
            }} 
            className="btn--fancy"
          >
          {!factory ? (
              "[contract not deployed]"
            ) : !account ?  (
              "[pls connect ]"
            ) : (
              "[start a new Token]"
            )}
            
          </button>
        </div>

        <div className="listings">
            <h1>new listings</h1>

            <div className="tokens">
              {!account ? (
                <p>pls connect wallet</p>
              ) : tokens.length === 0 ? (
                <p>no tokens listed</p>
              ) : (
                tokens.map((token,index) => (
                  <Token 
                    toggleTrade={() => {}}
                    token = {token}
                    key = {index}
                  />
                ))
              )}
            </div>
        </div>
      </main>
      
      {showCreate && (
        <List 
          toggleCreate={toggleCreate} 
          fee={fee} 
          provider={provider} 
          factory={factory} 
        />
      )}
    </div>
  );
}
