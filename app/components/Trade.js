import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { userAgentFromString } from "next/server"

function Trade({ toggleTrade, token, provider, factory }) {

   const[target, setTarget] = useState(0)
   cosnt[limit, setLimit] = useState(0)
   const[cost, setCost] = useState(0)

 
  async function getSaleDetails() {
    const target = await factory.TARGET()
    setTarget(target)
    const limit = await factory.TOKEN_LIMIT()
    setLimit(limit)
    const cost = await factory.getCost(token.sold)
    setCost(cost)
      
  }

  return (
    <div className="trade">
      <h2>trade</h2>
      <div className="token__details">
        <p className="name">{token.name}</p>
        <p>created by{token.creator.slice(0,6)+'...'+token.creator.slice(38,42)}</p>
        <p>Market Cap:{ethers.formatUnits(token.raised, 18)} ETH</p>
        <p className="name">{token.name}</p>
      </div>
      
      <button onClick={toggleTrade} className="btn--fancy">[cancle]</button>
    </div >
  ); 
}

export default Trade;