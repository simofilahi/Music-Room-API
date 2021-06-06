import "./App.css";
import axios from "axios";
import { GoogleLogin } from "react-google-login";

const responseGoogle = async (response) => {
  const data = await axios.post("http://localhost:4004/api/auth/google", {
    idToken: response.tokenId,
  });
  console.log(data);
};

function App() {
  return (
    <GoogleLogin
      clientId={
        "530974951834-mivmchdoqe7cm2uagje58hcce1dg07pg.apps.googleusercontent.com"
      }
      buttonText="Log in with Google"
      onSuccess={responseGoogle}
      // onFailure={handleLogin}
      cookiePolicy={"single_host_origin"}
    />
  );
}

export default App;
