import { useNavigate } from "react-router-dom";
import { moneda } from "../utils/formato";
import Icon from "./Icon";
import Vacio from "./Vacio";

function Cuentas({ cuentas }) {
  const navigate = useNavigate();
  const total = cuentas.reduce((s, c) => s + c.saldo, 0);

  return (
    <section className="card">
      <div className="card-head">
        <h2>Cuentas bancarias</h2>
        <span className="count">{cuentas.length}</span>
      </div>

      {cuentas.length === 0 ? (
        <Vacio titulo="Sin cuentas" texto="Agrega una cuenta para poder registrar pagos.">
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/cuenta/nueva")}>
            Nueva cuenta
          </button>
        </Vacio>
      ) : (
        <>
          {cuentas.map((c) => (
            <div className="account-item" key={c.id}>
              <span className="account-icon">
                <Icon name="credit-card" size={18} />
              </span>
              <span className="account-name">{c.nombre}</span>
              <span className="account-balance">{moneda(c.saldo)}</span>
            </div>
          ))}
          <div className="account-total">
            <span>Saldo total</span>
            <span>{moneda(total)}</span>
          </div>
        </>
      )}
    </section>
  );
}

export default Cuentas;
