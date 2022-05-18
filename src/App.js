import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './landingPage/Header';
import Banner from './landingPage/Banner';
import CreateNode from './landingPage/CreateNode';
//import Nodeslist from './landingPage/Nodeslist';
import AloraToken from './landingPage/AloraToken';
import Footer from './landingPage/Footer';
import Loader from './landingPage/Loader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Whitelist from './landingPage/Whitelist';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';





function App() {
  const [userId, setUserId] = useState('');
  const [reload, setReload] = useState(false);
  const [nodesData, setNodeData] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [claimableReward, setClaimableReward] = useState(0);
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState(null);
  const [msg, setMsg] = useState('');
  const [task, setTask] = useState('')
  const [walletNetwork, setWalletNetwork] = useState(0);
  const [wallet, setWallet] = useState(false);
  return (
    <Router >
      <Routes>
        <Route path='/' element={
          <>
            {loading && <Loader msg={msg} task={task} />}
            <Header
              setUserId={setUserId}
              userId={userId}
              setNetworkId={setNetworkId}
              setLoading={setLoading}
              setMsg={setMsg}
              wallet={wallet}
              setWallet={setWallet}
              setWalletNetwork={setWalletNetwork}
              walletNetwork={walletNetwork}
              setTask={setTask}
            />

            <Banner
              userId={userId}
              reload={reload}
              nodesData={nodesData}
              setNodeData={setNodeData}
              networkId={networkId}
              claimableReward={claimableReward}
              setClaimableReward={setClaimableReward}
              setOwner={setOwner}
              setLoading={setLoading}
              setMsg={setMsg}
              walletNetwork={walletNetwork}
              setTask={setTask}
            />
            <CreateNode
              userId={userId}
              setReload={setReload}
              nodesData={nodesData}
              networkId={networkId}
              loading={loading}
              setLoading={setLoading}
              owner={owner}
              setMsg={setMsg}
              walletNetwork={walletNetwork}
              setTask={setTask}

            />

            <AloraToken />
            <Footer />
            <ToastContainer />
          </>
        } />
        <Route path='/whitelist' element={
          <>
            {loading && <Loader msg={msg} task={task} />}
            <Whitelist
              setUserId={setUserId}
              userId={userId}
              setLoading={setLoading}
              setMsg={setMsg}
              setWallet={setWallet}
              walletNetwork={walletNetwork}
              setWalletNetwork={setWalletNetwork}
              setNetworkId={setNetworkId}
              setTask={setTask}
            />
            <Footer />
            <ToastContainer />
          </>
        } />

      </Routes>
    </Router>
  );
}

export default App;
