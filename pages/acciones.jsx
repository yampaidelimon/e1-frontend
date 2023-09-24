import React from 'react';
import axios from 'axios';
import { getSession, withPageAuthRequired } from '@auth0/nextjs-auth0';

import Highlight from '../components/Highlight';
import { getManagementAPIToken, getUserId } from '../utils/auth0';

export default function SSRPage({ user, stocksTransactions }) {
  return (
    <div className="mb-5" data-testid="ssr">
      <h1 data-testid="ssr-title">Mis acciones</h1>
      <div data-testid="ssr-text">
        <p>A continuación se listan las acciones adquiridas o en proceso del usuario</p>
      </div>

      {/* Mostrar la información de los stocks */}
      {stocksTransactions.map((stockTransaction, index) => {
        const { transaction, stock, company } = stockTransaction;
        const estado =
          transaction.state === 'done'
            ? 'Aprobado'
            : transaction.state === 'rejected'
            ? 'Rechazada'
            : 'En proceso';
        return (
          <div key={index}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>
                {index + 1}. {company.shortName} ({company.symbol})
              </h3>
              <p style={{ margin: 0 }}></p>
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <p>Estado: {estado}</p>
              <p>Cantidad: {transaction.quantity}</p>
              <p>Precio total: {(stock.price * transaction.quantity).toFixed(2)}</p>
              <p>
                Precio unitario: {stock.price} {stock.currency}
              </p>
              <p>Última actualización: {new Date(transaction.updatedAt).toLocaleDateString('es-CL')}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export async function getServerSideProps(context) {
  const accessToken = await getManagementAPIToken();
  const session = await getSession(context.req, context.res);
  const user = session?.user;
  const userId = await getUserId(accessToken, user.sub);

  if (userId) {
    try {
      // IMPLEMENTAR: Aquí se obtienen las acciones en proceso o compradas del usuario
      const response = await axios.get(`${process.env.SERVER_ENDPOINT}/my-transactions`, {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          userId: userId
        }
      });
      return {
        props: {
          stocksTransactions: response.data
        }
      };
    } catch (error) {
      console.error('Error fetching stocks transactions:', error);
      return {
        props: {
          stocksTransactions: []
        }
      };
    }
  }

  return userProps;
}
