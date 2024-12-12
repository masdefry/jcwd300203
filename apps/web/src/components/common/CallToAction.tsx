import Link from "next/link";

const CallToAction = () => {
  return (
    <div className="row">
      <div className="col-lg-8">
        <div className="start_partner tac-smd">
          <h2>Become a Tenant Now!</h2>
          {/* <p>We only work with the best companies around the globe</p> */}
          <p>Ngapain Lama Yagaaaa</p> 
        </div>
      </div>
      {/* End .col */}

      <div className="col-lg-4">
        <div className="parner_reg_btn text-right tac-smd">
          <Link href="/register" className="btn btn-thm2">
            Register Now
          </Link>
        </div>
      </div>
      {/* End .col */}
    </div>
  );
};

export default CallToAction;