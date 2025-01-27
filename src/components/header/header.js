import React from 'react';
import {Link} from 'react-router-dom';
import { ReactComponent as Logo } from '../../assets/crown.svg';
import './header.scss';

const Header = ({ hidden }) => (
  <div className='header'>
    <Link className='logo-container' to="/">
      <Logo className='logo' />
    </Link>

    <div className='options'>
      <Link className='option' to='/'>
        HOME PAGE
      </Link>

    </div>
  </div>
);

//{user: {curentUser}, cart: {hidden}}

export default Header;
/**

 */