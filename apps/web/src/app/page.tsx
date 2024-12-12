import Image from 'next/image'
import styles from './page.module.css'
import Header from '@/components/home/Header'
import MobileMenu from '@/components/common/header/MobileMenu'
import PopupSignInUp from '@/components/common/PopupSignInUp'
import HeroSlider from '@/components/home/HeroSlider'
import FeaturedProperties from '@/components/home/FeaturedProperties'
import FindProperties from '@/components/home/FindProperties'
import WhyChoose from '@/components/common/WhyChoose'
import Blogs from '@/components/common/Blogs'
import Partners from '@/components/common/Partners'
import CallToAction from '@/components/common/CallToAction'
import Footer from '@/components/common/footer/Footer'
import CopyrightFooter from '@/components/common/footer/CopyrightFooter'
import Wrapper from '@/components/layout/Wrapper'

export default function Home() {
  return (
    <Wrapper>
      {/* <!-- Main Header Nav --> */}
      <Header />

      {/* <!--  Mobile Menu --> */}
      <MobileMenu />

      {/* <!-- Modal --> */}
      <PopupSignInUp />

      {/* <!-- Home Design --> */}
      <section className="p0">
        <div className="container-fluid p0">
          <div className="home8-slider">
            <div className="bs_carousel ">
              <HeroSlider />
            </div>
          </div>
        </div>
      </section>

      {/* <!-- Feature Properties --> */}
      <section id="feature-property" className="feature-property bgc-f7">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-3">
              <div className="main-title text-center mb40">
                <h2>Featured Properties</h2>
                <p>Handpicked properties by our team.</p>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="feature_property_slider gutter-x15">
                <FeaturedProperties />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <!-- Property Cities --> */}
      <section id="property-city" className="property-city pb30">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-3">
              <div className="main-title text-center">
                <h2>Find Properties in These Cities</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <FindProperties />
          </div>
        </div>
      </section>

      {/* <!-- Why Chose Us --> */}
      <section id="why-chose" className="whychose_us bgc-f7 pb30">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-3">
              <div className="main-title text-center">
                <h2>Why Choose Us</h2>
                <p>We provide full service at every step.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <WhyChoose />
          </div>
        </div>
      </section>

      {/* <!-- Our Blog --> */}
      <section className="our-blog bgc-f7 pb30">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-3">
              <div className="main-title text-center">
                <h2>Articles & Tips</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <Blogs />
          </div>
        </div>
      </section>

      {/* <!-- Our Partners --> */}
      <section id="our-partners" className="our-partners">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-3">
              <div className="main-title text-center">
                <h2>Our Partners</h2>
                <p>We only work with the best companies around the globe</p>
              </div>
            </div>
          </div>
          <div className="row">
            <Partners />
          </div>
        </div>
      </section>

      {/* <!-- Start Call to Action --> */}
      <section className="start-partners bgc-thm pt50 pb50">
        <div className="container">
          <CallToAction />
        </div>
      </section>

      {/* <!-- Our Footer --> */}
      <section className="footer_one">
        <div className="container">
          <div className="row">
            <Footer />
          </div>
        </div>
      </section>

      {/* <!-- Our Footer Bottom Area --> */}
      <section className="footer_middle_area pt40 pb40">
        <div className="container">
          <CopyrightFooter />
        </div>
      </section>
    </Wrapper>
  )
}