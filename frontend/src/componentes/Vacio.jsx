import Icon from "./Icon";

function Vacio({ titulo, texto, children }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name="inbox" size={22} />
      </div>
      <strong>{titulo}</strong>
      <span>{texto}</span>
      {children}
    </div>
  );
}

export default Vacio;
