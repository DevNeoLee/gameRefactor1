import {AppProvider} from "./AppContext";

import Home from "./pages/Home/index";
import Welcome from "./pages/Welcome/index";
import Instruction from "./pages/Instruction";
import Quizzes from "./pages/Quizzes";
import Game from "./pages/Game";
import NotFound from "./pages/NotFound";
import Survey from "./pages/Survey";
import Stat from "./pages/Stat";

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import './App.scss'
import Stopped from "./pages/Stopped";
import GoodBye from "./pages/GoodBye";
import Dropout from "./pages/Dropout";
import { isMobile, isTablet } from 'react-device-detect';

export default function App() {
  // if (isMobile || isTablet) {
  //   return (
  //     <div>
  //       <h1>Unsupported Device</h1>
  //       <p>Sorry, this application does not support tablets or small devices.</p>
  //     </div>
  //   );
  // }
  
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/instruction" element={<Instruction />} />         
          <Route path="/prequiz" element={<Quizzes />} />
          <Route path="/game" element={<Game />} />
          <Route path="/notfound" element={<NotFound />} />
          <Route path="/stopped" element={<Stopped />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/goodbye" element={<GoodBye />} />
          <Route path="/dropout" element={<Dropout />} />
          <Route path="/stat" element={<Stat />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
