import React from 'react';
import CLIENT_ID from "./Secrets.js";

<<<<<<< HEAD
const baseURI = 'https://www.linkedin.com/oauth/v2/authorization';
const redirectURI = 'http://localhost:8080/api/linkedin';
const state = '46S7DJD0a9b';
const scope = 'r_liteprofile%20r_emailaddress';
=======
const baseURI = "https://www.linkedin.com/oauth/v2/authorization";
const redirectURI = "http://localhost:8080/api/login";
const state = "46S7DJD0a9b";
const scope = "r_liteprofile%20r_emailaddress";
>>>>>>> 5eae75815773a442f867b626c0ca42eae9cb08be
const authorizationURI = `${baseURI}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${redirectURI}&state=${state}&scope=${scope}`;

function HomePage() {
  return (
    <div className="homePage">
      <p>This will be the HomePage</p>
      <a href={authorizationURI}>
        <button className="headerButton" id="loginButton">Login</button>
      </a>
    </div>
  );
}

export default HomePage;
