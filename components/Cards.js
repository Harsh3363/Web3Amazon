// going to contain all of our assets
import React, { useState, useContext, useEffect } from 'react'
import Card from './Card'
import { AmazonContext } from '../context/AmazonContext'

const Cards = () => {
    const styles = {
        container: `h-full w-full flex flex-col ml-[20px] -mt-[50px]`,
        title: `text-xl font-bolder mb-[20px] mt-[30px]  ml-[30px]`,
        cards: `flex items-center  flex-wrap gap-[80px]`,
      }

    // destructuring assets from the AmazonContext
    const{assets} = useContext(AmazonContext)

    //static db when incase we are not fetching data from the moralisDB ->
    // const item = {
    //     id:0,
    //     attributes:{
    //         name:"Memberoneio",
    //         price:2,
    //         src:"https://media2.giphy.com/media/44VeDB0HHAptBgLIUt/giphy.gif?cid=ecf05e47gbkz6ek1eqww5ds1i2kxbx2bmtw6o8h0zbjo2zx5&rid=giphy.gif&ct=g"
    //     }
    // }

    console.log(assets);

  return (
    <div className={styles.container}>
        <div className={styles.title}>New Release</div>
            <div className={styles.cards}>
{/* mapping through assets class from thr moralisDB */}
        {assets.map(item => {
            let asset = item.attributes

            return <Card key={item.id} item={item.attributes} />
          })}
            </div>
            </div>
  )
}

export default Cards