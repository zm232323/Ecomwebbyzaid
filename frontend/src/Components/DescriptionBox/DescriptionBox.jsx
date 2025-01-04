import React from 'react'
import './DescriptionBox.css'
const DescriptionBox = () => {
  return (
    <div className='description-box'>
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">
                Description
            </div>
            <div className="descriptionbox-nav-box fade">
                Review (122)
            </div>
        </div>
        <div className="desciptionbox-description">
            <p>"Discover a wide range of trendy, high-quality clothing for every occasion at unbeatable prices. From casual wear to formal outfits, our collection is designed to fit your style and comfort needs. Enjoy seamless shopping with easy navigation, secure payment options, and swift delivery. Stay ahead of fashion trends with our latest arrivals and exclusive offers. Shop your favorite styles today and elevate your wardrobe effortlessly!"</p>
            <p>"Discover the latest trends in fashion with our curated collection of stylish and affordable clothing for every occasion. Shop effortlessly with fast delivery and secure checkout. Revamp your wardrobe today!"</p>
        </div>
    </div>
  )
}

export default DescriptionBox