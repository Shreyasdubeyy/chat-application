import { Route, Routes } from "react-router-dom";
import Login from "./Login/Login"
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Register from "./register/Register";
import Home from "./home/Home";
import { VerifyUser } from "./utils/VerifyUser";
import Profile from "./home/components/Profile";




function App() {

  return (
    <>
      <div className="flex flex-col w-full h-full">
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/profile" element={<Profile/>} />
          <Route element={<VerifyUser/>}>
            <Route path="/" element={<Home/>}/>
          </Route>
        </Routes>
      </div>
      <ToastContainer/>
    </>
  )
}

export default App
