import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';


const StockDetailPage = ({ latestStock, company, stocks, totalPages, currentPage }) => {
  const router = useRouter();
  const [page, setPage] = useState(parseInt(currentPage));

  useEffect(() => {
    router.push(`/stock-detail/${company.symbol}?page=${page}`);
  }, [page]);

  return (
    <div>
      {/* stock más reciente */}
      <h1>Detalles de {company.symbol}</h1>
      <p>Precio: {latestStock.price} {latestStock.currency}</p>
      <p>Actualización: {new Date(latestStock.dateUpdate).toLocaleDateString("es-ES")}</p>
      <button onClick={() => router.push(`/buy-stock/${company.symbol}`)}>Comprar acciones</button>

      {/* Paginación */}
      <div>
        {page > 1 && <button onClick={() => setPage(Math.max(1, page - 1))}>Página anterior</button>}
        <span> Página {page} de {totalPages} </span>
        {page < totalPages && <button onClick={() => setPage(Math.min(totalPages, page + 1))}>Página siguiente</button>}
      </div>

      {/* Historial */}
      <h2>Historial</h2>
      {stocks.map((stock, index) => (
        <div key={index}>
          <p>Precio: {stock.price} {stock.currency}</p>
          <p>Actualización: {new Date(stock.dateUpdate).toLocaleDateString("es-ES")}</p>
        </div>
      ))}
    </div>
  );
}

export default StockDetailPage;


export async function getServerSideProps(context) {
  const symbol = context.params.symbol;
  const page = context.query.page || 1;

  try {
    // stock más reciente
    const latestResponse = await axios.get(`${process.env.SERVER_ENDPOINT}/stocks/${symbol}?page=1`);
    const latestStock = latestResponse.data.data.stocks[0];


    const response = await axios.get(`${process.env.SERVER_ENDPOINT}/stocks/${symbol}?page=${page}`);

    if (response.data.data.stocks.length === 0) {
      return {
        notFound: true
      };
    }

    return {
      props: {
        latestStock: latestStock,
        company: response.data.company,
        stocks: response.data.data.stocks,
        totalPages: response.data.data.totalPages,
        currentPage: response.data.data.currentPage
      }
    };
  } catch (error) {
    console.error("Error fetching stock details:", error);
    return {
      notFound: true
    };
  }
}

