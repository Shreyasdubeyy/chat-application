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
        <footer className="w-full text-center py-2 text-xs text-slate-500 bg-slate-950 border-t border-white/5 flex-shrink-0">
          Developed by <span className="font-semibold text-purple-400">Shreyas Dubey</span>
        </footer>
      </div>
      <ToastContainer/>
    </>
  )
}

export default App
