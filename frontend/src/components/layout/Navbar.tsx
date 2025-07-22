import logo from "@/assets/zenLogo.png";
import { Link } from "react-router-dom";


const Navbar = () => {
  return (
    <div className="py-4 w-full flex  items-center border-b">
      <div className="w-full flex justify-between items-center mx-auto max-w-6xl">
        <Link to={'/'}>
          <img src={logo} alt="Zentroe Logo" className="h-5" />
        </Link>
        <Link to={'/'}>
          <button className="text-2xl">&times;</button>
        </Link>
      </div>

    </div>
  )
}

export default Navbar

export const LoginNavbar = () => {
  return (
    <div className="py-4 w-full flex  items-center border-b">
      <div className="w-full flex justify-between items-center mx-auto max-w-6xl">
        <Link to={'/'}>
          <img src={logo} alt="Zentroe Logo" className="h-5" />
        </Link>
        {/* <button className="text-2xl">&times;</button> */}
      </div>

    </div>
  )
}