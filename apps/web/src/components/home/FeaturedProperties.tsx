'use client'
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Slider from "react-slick";
import properties from "../../data/properties";
import Image from "next/image";
import instance from "@/utils/axiosInstance";

const FeaturedProperties = () => {

  const {data, isLoading, isError} = useQuery({
    queryKey: ['landings'],
    queryFn: async () => {
          const res = await instance.get('/property')
            return res?.data?.data   
    }
  })

  console.log('data: ',data)
  
  const settings = {
    dots: true,
    arrows: false,
    slidesToShow: 3,
    slidesToScroll: 3,
    autoplay: true,
    autoplaySpeed: 3000, 
    speed: 1200,
    infinite: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 3,
        },
      },
    ],
  };

  let content = properties?.slice(0, data?.length)?.map((item) => {
    const matchingData = data?.find((d: any) => d.id === item.id);
  
    return (
      <div className="item" key={item.id}>
        <div className="feat_property">
          <div className="thumb">
            <Image
              width={343}
              height={220}
              className="img-whp w-100 h-100 cover"
              src={item.img}
              alt="fp1.jpg"
            />
            <div className="thmb_cntnt">
              <ul className="tag mb0">
                {item.saleTag.map((val, i) => (
                  <li className="list-inline-item" key={i}>
                    <a href="#">{val}</a>
                  </li>
                ))}
              </ul>
  
              <ul className="icon mb0">
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
              </ul>
  
              <Link
                href={`/listing-details-v1/${item.id}`}
                className="fp_price"
              >
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
                  isNaN(Number(matchingData?.price)) ? 0 : Number(matchingData?.price)
                )}
                <small>/night</small>
              </Link>
            </div>
          </div>
  
          <div className="details">
            <div className="tc_content">
              <p className="text-thm">{matchingData?.category || item.type}</p>
              <h4>
                <Link href={`/listing-details-v1/${item.id}`}>
                  {matchingData?.name || item.title}
                </Link>
              </h4>
              <p>
                <span className="flaticon-placeholder"></span>
                {matchingData?.address||item.location}
              </p>
  
              <ul className="prop_details mb0">
                {item.itemDetails.map((val, i) => (
                  <li className="list-inline-item" key={i}>
                    <a href="#">
                      {val.name}: {val.number}
                    </a>
                  </li>
                ))}
              </ul>
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
                  <Link href="/agent-v2">{item.posterName}</Link>
                </li>
              </ul>
              <div className="fp_pdate float-end">{item.postedYear}</div>
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <>
      <Slider {...settings} arrows={false}>
        {content}
      </Slider>
    </>
  );
};

export default FeaturedProperties;
