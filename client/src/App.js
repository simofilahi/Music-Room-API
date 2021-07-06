import "./App.css";
import axios from "axios";
import { GoogleLogin } from "react-google-login";
import FacebookLogin from "react-facebook-login";

const responseGoogle = async (response) => {
  const data = await axios.post("http://localhost:4004/api/auth/google", {
    accessToken: response.accessToken,
  });
  console.log(data);
};

const responseFacebook = async (response) => {
  const data = await axios.post("http://localhost:4004/api/auth/facebook", {
    accessToken: response.accessToken,
  });
  console.log(response);
};

function App() {
  return (
    <div>
      <div>
        <GoogleLogin
          clientId={
            "530974951834-mivmchdoqe7cm2uagje58hcce1dg07pg.apps.googleusercontent.com"
          }
          buttonText="Log in with Google"
          onSuccess={responseGoogle}
          // onFailure={handleLogin}
          cookiePolicy={"single_host_origin"}
        />
      </div>
      <div>
        <FacebookLogin
          appId="563098104694816"
          autoLoad={true}
          fields="name,email,picture"
          callback={responseFacebook}
        />
      </div>
    </div>
  );
}

export default App;
