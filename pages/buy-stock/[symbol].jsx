import axios from 'axios';
import { useState } from 'react';
import { getSession } from '@auth0/nextjs-auth0';

import { getManagementAPIToken, getUserId } from '../../utils/auth0';


const BuyStockPage = (props) => {
  const { userId, company, latestStock, userBalance: _userBalance, serverEndpoint } = props;

  const [quantity, setQuantity] = useState(0);
  const [userBalance, setUserBalance] = useState(_userBalance);

  const handleBuy = async () => {
    // Logica para la compra.... en proceso
    const totalPrice = quantity * latestStock.price;
    if (totalPrice > 0 && totalPrice <= userBalance) {
      const initialUpdatedBalance = userBalance - totalPrice;
      console.log("Trying to buy")
      const buyResponse = await axios.post(`${serverEndpoint}/stocks/buy`,
        {
          userId: userId,
          symbol: company.symbol,
          quantity: quantity
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      if (buyResponse.status === 503)
        alert(`Cantidad inválida para comprar.`);
      else if (buyResponse.status !== 201)
        alert(`Error de servidor comprando acciones.`);
      else {
        console.log("Trying to update wallet");
        const realUpdatedBalance = userBalance - buyResponse.data.totalPrice;
        const walletResponse = await axios.patch(`${serverEndpoint}/edit-wallet`,
          {
            userId: userId,
            newBalance: realUpdatedBalance
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
        if (walletResponse.status !== 200){
          // TODO: Revertir la compra en caso de que no se haya podido descontar del saldo
          return alert(`Error de servidor actualizando saldo.`);
        }
        setUserBalance(realUpdatedBalance);
        alert(`${
          initialUpdatedBalance !== realUpdatedBalance ?
            `(Precio de compra real: ${buyResponse.data.totalPrice})` :
            ""
          }Solicitud de compra procesada correctamente, podrás revisar en "Mis acciones" el estado de tu compra. Tu nuevo saldo es: ${
            (userBalance - buyResponse.data.totalPrice).toFixed(2)
          }`
        );
      }

    } else
      alert("Cantidad inválida para comprar.");
  };

  return (
    <div>
      <h1>Comprar acciones de {company.symbol}</h1>
      <p>Precio: {latestStock.price} {latestStock.currency}</p>
      <p>Saldo disponible: ${userBalance.toFixed(2)}</p>

      <label>
        Cantidad:
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(
            Math.max(
              Math.min(
                e.target.value,
                Math.floor(userBalance / latestStock.price)
              ),
              0
            )
          )}
          max={userBalance / latestStock.price}
        />
      </label>

      <button onClick={handleBuy}>Comprar</button>
    </div>
  );
}



export async function getServerSideProps(context) {
  const accessToken = await getManagementAPIToken();
  const session = await getSession(context.req, context.res);
  const user = session?.user;
  const userId = await getUserId(accessToken, user.sub);

  // Obtener el stock más reciente
  const symbol = context.params.symbol;
  const stockResponse = await axios.get(`${process.env.SERVER_ENDPOINT}/stocks/${symbol}?page=1`);
  const latestStock = stockResponse.data.data.stocks[0];

  // Obtener el saldo del usuario desde Auth0
  const walletResponse = await axios.get(`${process.env.SERVER_ENDPOINT}/my-wallet`, {
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      userId: userId
    }
  });
  const myWallet = walletResponse.data;
  const { balance } = myWallet;

  return {
    props: {
      userId: userId,
      company: stockResponse.data.company,
      latestStock: latestStock,
      userBalance: balance,
      serverEndpoint: process.env.SERVER_ENDPOINT
    }
  };
}


export default BuyStockPage;
