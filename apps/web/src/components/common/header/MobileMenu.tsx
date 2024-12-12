import Link from "next/link";
import MobileMenuContent from "./MobileMenuContent";

const MobileMenu = () => {
  return (
    // <!-- Main Header Nav For Mobile -->
    <div className="stylehome1 h0 mega-menu-wrapper">
      <div className="mobile-menu">
        <div className="header stylehome1 flex items-center justify-between px-4 py-2">
          {/* Menu Toggle (Three Stripes) */}
          <ul className="menu_bar_home2">
            <li className="list-inline-item list_s">
              <Link href="/login">
                <span className="flaticon-user"></span>
              </Link>
            </li>
            <li
              className="list-inline-item"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasMenu"
              aria-controls="offcanvasMenu"
            >
              <a>
                <span></span>
              </a>
            </li>
          </ul>

          {/* Centered Text */}
          <div className="main_logo_home2">
            <span className="text-lg font-semibold">RentUp</span>
          </div>

          {/* Login Icon */}
          <ul className="menu_bar_home2 flex items-center">
            <li className="list-inline-item list_s"></li>
          </ul>
        </div>
      </div>
      {/* <!-- /.mobile-menu --> */}

      <div
        className="offcanvas offcanvas-start"
        tabIndex={-1}
        id="offcanvasMenu"
        aria-labelledby="offcanvasMenuLabel"
        data-bs-scroll="true"
      >
        <MobileMenuContent />
      </div>
    </div>
  );
};

export default MobileMenu;