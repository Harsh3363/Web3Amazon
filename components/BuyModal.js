import React, { useContext , useEffect } from 'react'
import Link from 'next/link'
import {IoIosClose} from 'react-icons/io'
import { HashLoader  } from 'react-spinners'
import { AmazonContext } from '../context/AmazonContext'

const BuyModal = ({close}) => {

    const styles = {
        container: `h-full w-full flex flex-col `,
        closeX: `w-full h-[50px] flex items-center justify-end mb-[20px]`,
        title: `text-3xl font-bold flex flex-1 items-center mt-[20px] justify-center mb-[40px]`,
        content: `flex w-full mb-[30px] text-xl justify-center`,
        input: `w-[50%] h-[50px] bg-[#f7f6f2] rounded-lg p-[10px] flex mx-auto`,
        inputBox: `w-full h-full flex items-center justify-center bg-[#f7f6f2] focus:outline-none`,
        price: `w-full h-full flex justify-center items-center mt-[20px] font-bold text-3xl`,
        buyBtn: `w-[20%] h-[50px] bg-[#000] mt-[40px] rounded-lg p-[10px] flex mx-auto text-white justify-center items-center cursor-pointer`,
        loaderContainer: `w-full h-[500px] flex items-center justify-center`,
        loader: `w-full h-full flex items-center justify-center`,
        etherscan: `w-full h-full flex items-center justify-center text-green-500 text-2xl mt-[20px] font-bold cursor-pointer`,
        success: `w-full h-full flex items-center justify-center text-xl mt-[20px] font-bolder`,
      }

    const {
        amountDue,
        setAmountDue,
        tokenAmount,
        setTokenAmount,
        isLoading,
        setIsLoading,
        etherscanLink,
        SetEtherscanLink,
        buyTokens
    } = useContext(AmazonContext)

useEffect(()=>{
    calculatePrice()
},[tokenAmount])

    // this function is there to show the price on the front-end side
    const calculatePrice = () => {
        const price = parseFloat(tokenAmount * 0.0001)
        price = price.toFixed(4)
        setAmountDue(price)
    }

  return (
    <div className={styles.container}>
        {isLoading ?(
            <>
                <div className={styles.loaderContainer}>
                    {/* animation */}
                    <HashLoader  size={50} />
                </div>
            </>
        ) : (
        <>
            <div className={styles.closeX}>
                <IoIosClose
                onClick={() => {
                    close()
                    setTokenAmount('')
                    // setEtherscanLink('')
                    setAmountDue('')
                }}
                fontSize={50}
                className='cursor-pointer'
                />
            </div>
            <div className={styles.title}>Buy more nftCoins Here!</div>
            <div className={styles.content}>
                Select how many would you like to buy
            </div>
            <div className={styles.input}>
                <input
                type='text'
                placeholder='Amount....'
                className={styles.inputBox}
                // this is how we can grab value inside the input field -> 
                onChange = {e => setTokenAmount(e.target.value)}
                value={tokenAmount}
                />
            </div>
            <div className={styles.price}>
                {/* to show total Due: */}
                Total Due: {''}
                {tokenAmount && tokenAmount > 0 ? amountDue + "ETH" : '0 ETH' }
            </div>
            <button className={styles.buyBtn}
            // disables the button if the condition is not met
            disabled={!tokenAmount || tokenAmount <0 }
            onClick = {() => {
                setIsLoading(true)
                buyTokens()
            }}
            >
                Buy
            </button>
            {/* if there is etherscanLink then showing it on the front-end as well */}
            {etherscanLink && (
                <>
                <div className={styles.success}>
                    Transaction successful check out your receipt 
                </div>
                <Link className={styles.etherscanLink} href={`${etherscanLink}`}>
                    <a className={styles.etherscan} target='_blank'>
                        Transaction receipt
                    </a>
                </Link>
            </>
            )}
        </>

        )}
    </div>
  )
}

export default BuyModal