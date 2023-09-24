import React from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Highlight from '../components/Highlight';
import axios from 'axios';

export default function SSRPage({ user, stocks }) {
  return (
    <div className="mb-5" data-testid="ssr">
      <h1 data-testid="ssr-title">Mercado</h1>
      <div data-testid="ssr-text">
        <p>
          A continuación se listan las acciones disponibles en el mercado y su detalle, al hacer click en una puedes
          comprar acciones
        </p>
      </div>

      {stocks.map((stock, index) => (
        <div key={index}>
          <h3>
            {stock.company.shortName} ({stock.company.symbol})
          </h3>
          <p>
            Precio: {stock.lastStock.price} {stock.lastStock.currency}
          </p>
          <p>Actualización: {new Date(stock.lastStock.dateUpdate).toLocaleDateString('es-CL')}</p>
          <button onClick={() => (window.location.href = `/stock-detail/${stock.company.symbol}`)}>Ver detalle</button>
        </div>
      ))}
    </div>
  );
}

export async function getServerSideProps(context) {
  const userProps = await withPageAuthRequired()(context);

  if (userProps.props) {
    try {
      const response = await axios.get(`${process.env.SERVER_ENDPOINT}/stocks`);
      const stocks = response.data;
      stocks.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      return {
        ...userProps,
        props: {
          ...userProps.props,
          stocks: stocks
        }
      };
    } catch (error) {
      console.error('Error fetching stocks:', error);
      return {
        ...userProps,
        props: {
          ...userProps.props,
          stocks: []
        }
      };
    }
  }

  return userProps;
}
