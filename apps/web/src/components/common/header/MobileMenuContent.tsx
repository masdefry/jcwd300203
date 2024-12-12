'use client'

// import "react-pro-sidebar/dist/css/styles.css";
import {
//   ProSidebar,
//   SidebarHeader,
//   SidebarFooter,
  Menu,
  MenuItem,
  SubMenu,
//   SidebarContent,
  Sidebar
} from "react-pro-sidebar";
import Link from "next/link";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const blog = [
  { id: 1, name: "Blog List 1", routerPath: "/blog-list-1" },
  { id: 2, name: "Blog List 2", routerPath: "/blog-list-2" },
  { id: 3, name: "Blog List 3", routerPath: "/blog-list-3" },
  {
    id: 4,
    name: "Blog Details",
    routerPath: "/blog-details",
  },
];

const pages = [
  {
    name: "About Us",
    routerPath: "/about-us",
  },
  {
    name: "Gallery",
    routerPath: "/gallery",
  },
  {
    name: "Faq",
    routerPath: "/faq",
  },
  {
    name: "LogIn",
    routerPath: "/login",
  },
  { name: "Compare", routerPath: "/compare" },
  { name: "Membership", routerPath: "/membership" },

  {
    name: "Register",
    routerPath: "/register",
  },
  {
    name: "Service",
    routerPath: "/service",
  },
  {
    name: "404 Page",
    routerPath: "/404",
  },
  {
    name: "Terms & Conditions",
    routerPath: "/terms",
  },
];

const MobileMenuContent = () => {
  const pathname = usePathname()
  const router = useRouter()

  return (
  <>
    <div className="sidebar-header">
      <Link href="/" className="sidebar-header-inner">
        <Image
          width={40}
          height={45}
          className="nav_logo_img img-fluid mt20"
          src="/assets/images/header-logo2.png"
          alt="header-logo.png"
        />
        <span className="brand-text">RentUp</span>
      </Link>
      {/* End .logo */}

      <div
        className="fix-icon"
        data-bs-dismiss="offcanvas"
        aria-label="Close"
      >
        <span className="flaticon-close"></span>
      </div>
      {/* Mobile Menu close icon */}
    </div>

    {/* End logo */}
    
    {/* <Sidebar> */}
    <div style={{maxHeight:'calc(100vh - 100px)', overflowY:'auto'}}>
        <Menu>
          <MenuItem
            className={pathname === "/" ? "ui-active" : "inactive-mobile-menu"}
            active={pathname === "/"}
          >
            <div onClick={() => router.push("/")}>
              Home
            </div>
          </MenuItem>
          {/* End Home Menu Item */}

          <MenuItem
            className={pathname === "/listing" ? "ui-active" : "inactive-mobile-menu"}
            active={pathname === "/listing"}
          >
            <div onClick={() => router.push("/listing")}>
              Listing
            </div>
          </MenuItem>
          {/* End Pages Listing */}

          <MenuItem
            className={pathname === "/property" ? "ui-active" : "inactive-mobile-menu"}
            active={pathname === "/property"}
          >
            <div onClick={() => router.push("/property")}>
              Property
            </div>
          </MenuItem> 
          {/* End Pages Property */}

          <SubMenu
            label="Blog"
            className={
              blog.some(
                (page) =>
                  page.routerPath?.split('/')[1] === pathname.split('/')[1] 
                  // page.routerPath?.split('/')[1] + "/[id]" === pathname.split('/')[1]
              )
                ? "parent-menu-active"
                : 'inactive-mobile-menu'
            }
          >
            {blog.map((val, i) => (
              <MenuItem key={i}>
                <div
                  onClick={()=>router.push(val.routerPath)}
                  className={
                    pathname?.split('/')[1] === val.routerPath?.split('/')[1] 
                    // val.routerPath + "/[id]" === pathname.split('/')[1]
                      ? "ui-active"
                      : 'inactive-mobile-menu'
                  }
                >
                  {val.name}
                </div>
              </MenuItem>
            ))}
          </SubMenu>
          {/* End pages Blog */}

          <SubMenu
            label="Pages"
            className={
              pages.some((page) => page.routerPath?.split('/')[1] === pathname.split('/')[1])
                ? "parent-menu-active"
                : 'inactive-mobile-menu'
            }
          >
            {pages.map((val, i) => (
              <MenuItem key={i}>
                <div
                  onClick={()=>router.push(val.routerPath)}
                  className={
                    pathname?.split('/')[1] === val.routerPath?.split('/')[1] ? "ui-active" : 'inactive-mobile-menu'
                  }
                >
                  {val.name}
                </div>
              </MenuItem>
            ))}
          </SubMenu>
          {/* End pages Pages */}

          <MenuItem>
            <div
            onClick={()=>router.push("/contact")}
             
              className={
                pathname === "/contact" ? "ui-active" : 'inactive-mobile-menu'
              }
            >
              Contact
            </div>
          </MenuItem>

          <MenuItem>
            <div
            onClick={()=>router.push("/login")}
    
              className={pathname === "/login" ? "ui-active" : 'inactive-mobile-menu'}
            >
              <span className="flaticon-user"></span> Login
            </div>
          </MenuItem>

          <MenuItem>
            <div
            onClick={()=>router.push("/register")}
        
              className={
                pathname === "/register" ? "ui-active" : 'inactive-mobile-menu'
              }
            >
              <span className="flaticon-edit"></span> Register
            </div>
          </MenuItem>
        </Menu>
        </div>
      {/* </Sidebar> */}

      
        <Link
          href="/register"
          className="btn btn-block btn-lg btn-thm circle"
          style={{width:'90%',margin:'0px auto'}}
        >
          <span className="flaticon-plus"></span> Create Listing
        </Link>
  </>
  );
};

export default MobileMenuContent;