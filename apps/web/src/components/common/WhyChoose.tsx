const WhyChoose = ({ style = "" }) => {
    const whyCooseContent = [
      {
        id: 1,
        icon: "flaticon-high-five",
        title: "Your Trust is Our Badge of Honor",
        descriptions: `With years of experience, thousands of satisfied clients, and glowing reviews, we've built a reputation for delivering excellence in every transaction. Partner with us to achieve your dreams.`,
      },
      {
        id: 2,
        icon: "flaticon-home-1",
        title: "Your Perfect Match Awaits",
        descriptions: `From luxurious villas to cozy apartments, we offer a diverse portfolio of properties tailored to every taste, budget, and need. Your dream home is just a click away.`,
      },
      {
        id: 3,
        icon: "flaticon-profit",
        title: "Homeownership Within Reach",
        descriptions: `We simplify the financing process, offering expert guidance and flexible options to make property ownership easier than ever. Let us handle the complexities while you focus on your future.`,
      },
    ];
  
    return (
      <>
        {whyCooseContent.map((item) => (
          <div className="col-md-6 col-lg-4 col-xl-4" key={item.id}>
            <div className={`why_chose_us ${style}`}>
              <div className="icon">
                <span className={item.icon}></span>
              </div>
              <div className="details">
                <h4>{item.title}</h4>
                <p>{item.descriptions}</p>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };
  
  export default WhyChoose;
  