import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { userAgentFromString } from "next/server"
import { bigint } from "hardhat/internal/core/params/argumentTypes"

function Trade({ toggleTrade, token, provider, factory }) {

  const[target, setTarget] = useState(0)
  cosnt[limit, setLimit] = useState(0)
  const[cost, setCost] = useState(0)

  async function buyHandler(form) {
    const amount = form.get("amount")
    const cost = await factory.getCost(token.sold)
    const totlaCost = cost * bigint(amount)
    const signer = await provider.getSigner()

    const transaction = await factory.connect(signer).buy(
      token.token,
      ethers.parseUnits(amount, 18),
      {value: totlaCost}
    )
    await transaction.wait()
    toggleTrade()
  }
  
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
        <p>base cost: {ethers.formatUnits(cost, 18)}ETH</p>
      </div>
      
      {token.sold >= limit || token.raised >= target ?(
        <p className="disclaimer"> target reached! </p>
      ) : (
        <form action={buyHandler}>
          <input type="number" name="amount" min={1} max={10000} placeholder="1" />
          <input type="submit" value="[buy]" />
        </form>
      )
      }

      <button onClick={toggleTrade} className="btn--fancy">[cancle]</button>
    </div >
  ); 
}

export default Trade;