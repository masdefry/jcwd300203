'use client'

import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import SearchForm from "./SearchForm";

const HeroSlider = () => {
  const settings = {
    dots: true,
    arrow: false,
    speed: 1200,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000, 
    infinite: true, 
  };

  const sliderContent = [
    {
      id: 1,
      bgImage: "slidebg-1",
      title: "Rent Your Dream Property",
      subTitle: "From as low as Rp.100K per day with limited time offer discounts",
      propertyList: [
        {
          id: 1,
          img: "/assets/images/property/fp1.jpg",
          price: "2712957.75",
          type: "Villa",
          title: "Casa Clover Batubelig",
          location: `Jl. Batu Belig, Gang Casa No.8, Seminyak, Bali, Indonesia`,
          saleTag: ["Featured", "For Rent"],
          itemDetails: [
            { name: "Beds", number: "2" },
            { name: "Baths", number: "2" },
            { name: "SqFt", number: "1500" },
          ],
          posterAvatar: "/assets/images/property/pposter1.png",
          posterName: "Obie Ananda",
          postedYear: "1 year ago",
        },
      ],
    },
    {
      id: 2,
      bgImage: "slidebg-2",
      title: "Your Property, Our Priority.",
      subTitle: "Exceptional properties, exceptional value—limited-time offers await.",
      propertyList: [
        {
          id: 2,
          img: "/assets/images/property/fp2.jpg",
          price: "1856234.25",
          type: "Villa",
          title: "A Luxury Oasis in Umalas Canggu",
          location: `Umalas, Canggu, Bali, Indonesia`,
          saleTag: ["Featured", "For Rent"],
          itemDetails: [
            { name: "Beds", number: "2" },
            { name: "Baths", number: "2" },
            { name: "SqFt", number: "5280" },
          ],
          posterAvatar: "/assets/images/property/pposter1.png",
          posterName: "Obie Ananda",
          postedYear: "1 year ago",
        },
      ],
    },
    {
      id: 3,
      bgImage: "slidebg-3",
      title: "Live the Dream",
      subTitle: "Luxury properties in breathtaking destinations awaits you",
      propertyList: [
        {
          id: 3,
          img: "/assets/images/property/fp3.jpg",
          price: "5156206.25",
          type: "Villa",
          title: "Villa Shalimar beach front in Amed",
          location: `Amed, Bali, Indonesia`,
          saleTag: ["Featured", "For Rent"],
          itemDetails: [
            { name: "Beds", number: "3" },
            { name: "Baths", number: "3.5" },
            { name: "SqFt", number: "3500" },
          ],
          posterAvatar: "/assets/images/property/pposter2.png",
          posterName: "Wayan",
          postedYear: "1 year ago",
        },
      ],
    },
  ];

  return (
    <Slider {...settings} arrows={false}>
      {sliderContent.map((singleItem) => (
        <div
          className={`bs_carousel_bg ${singleItem.bgImage} vh-100`}
          key={singleItem.id}
        >
          <div className="carousel-slide ">
            <div className="bs-caption">
              <div className="container">
                <div className="row align-items-center">
                  <div className="col-md-7 col-lg-8">
                    <div className="main_title">{singleItem.title}</div>
                    <p className="parag">{singleItem.subTitle}</p>
                    {/* <Link href="/listing-grid-v4" className="btn-booking mt-4">
                      Book Now
                    </Link> */}
                    {/* Search Option Form */}
                    {SearchForm()}
                  </div>

                  <div className="col-md-5 col-lg-4">
                    {singleItem.propertyList.map((item) => (
                      <div className="item ms-10" key={item.id}>
                        <div className="feat_property home8">
                          <div className="details">
                            <div className="tc_content">
                              <ul className="tag ">
                                {item.saleTag.map((val, i) => (
                                  <li className="list-inline-item" key={i}>
                                    <a href="#">{val}</a>
                                  </li>
                                ))}
                              </ul>
                              <p className="text-thm">{item.type}</p>
                              <h4>
                                <Link href={`/listing-details-v2/${item.id}`}>
                                  {item.title}
                                </Link>
                              </h4>
                              <p>
                                <span className="flaticon-placeholder"></span>
                                {item.location}
                              </p>

                              <ul className="prop_details ">
                                {item.itemDetails.map((val, i) => (
                                  <li className="list-inline-item" key={i}>
                                    <a href="#">
                                      {val.name}: {val.number}
                                    </a>
                                  </li>
                                ))}
                              </ul>

                              {/* <ul className="icon mb0">
                                <li className="list-inline-item">
                                  <a href="#">
                                    <span className="flaticon-transfer-1"></span>
                                  </a>
                                </li>
                                <li className="list-inline-item">
                                  <a href="#">
                                    <span className="flaticon-heart"></span>
                                  </a>
                                </li>
                              </ul> */}

                              <Link
                                href={`/listing-details-v1/${item.id}`}
                                className="fp_price"
                              >
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(item.price))}
                                <small>/night</small>
                              </Link>

                            </div>
                            <div className="fp_footer">
                              <ul className="fp_meta float-start mb0">
                                <li className="list-inline-item">
                                  <Link href="/agent-v2">
                                    <Image
                                      width={40}
                                      height={40}
                                      src={item.posterAvatar}
                                      alt="pposter1.png"
                                    />
                                  </Link>
                                </li>
                                <li className="list-inline-item">
                                  <Link href="/agent-v2">
                                    {item.posterName}
                                  </Link>
                                </li>
                              </ul>
                              <div className="fp_pdate float-end">
                                {item.postedYear}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* End .container */}
            </div>
          </div>
        </div>
      ))}
    </Slider>
  );
};

export default HeroSlider;
