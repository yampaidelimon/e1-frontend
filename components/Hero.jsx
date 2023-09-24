import React from 'react';

import Logo from './Logo';

const Hero = () => (
  <div className="hero my-5 text-center" data-testid="hero">
    {/* <Logo testId="hero-logo" /> */}
    <h1 className="mb-4" data-testid="hero-title">
      PPE Fintech Async
    </h1>

    <p className="" data-testid="hero-lead">
      Para qué trabajar duro, si puedes invertir inteligentemente
    </p>
    <img src='./stonks.jpg' style={{ maxHeight: 300 }}/>
  </div>
);

export default Hero;
