import React, { useState } from "react";
import * as math from "mathjs";

const CardOddsCalculator = () => {
  const [presidentClaims, setPresidentClaims] = useState({
    fascist: 0,
    liberal: 0
  });
  const [chancellorClaims, setChancellorClaims] = useState({
    fascist: 0,
    liberal: 0
  });
  const [result, setResult] = useState(null);

  // ... (rest of your component code)

  const addCard = (role, type) => {
    if (role === "president") {
      setPresidentClaims({
        ...presidentClaims,
        [type]: presidentClaims[type] + 1
      });
    } else if (role === "chancellor") {
      setChancellorClaims({
        ...chancellorClaims,
        [type]: chancellorClaims[type] + 1
      });
    }
  };

  return (
    <div>
      <h2>Card Odds Calculator</h2>
      <h3>President's Claims</h3>
      <button onClick={() => addCard("president", "liberal")}>
        Add Blue Card
      </button>
      <button onClick={() => addCard("president", "fascist")}>
        Add Red Card
      </button>
      <p>Liberal cards: {presidentClaims.liberal}</p>
      <p>Fascist cards: {presidentClaims.fascist}</p>

      <h3>Chancellor's Claims</h3>
      <button onClick={() => addCard("chancellor", "liberal")}>
        Add Blue Card
      </button>
      <button onClick={() => addCard("chancellor", "fascist")}>
        Add Red Card
      </button>
      <p>Liberal cards: {chancellorClaims.liberal}</p>
      <p>Fascist cards: {chancellorClaims.fascist}</p>

      <button onClick={() => {}}>Calculate</button>
      {result && (
        <p>
          President's Odds: Liberal - {result.presidentOdds.oddsLiberal},
          Fascist - {result.presidentOdds.oddsFascist}
        </p>
      )}
      {result && (
        <p>
          Chancellor's Odds: Liberal - {result.chancellorOdds.oddsLiberal},
          Fascist - {result.chancellorOdds.oddsFascist}
        </p>
      )}
    </div>
  );
};

export default CardOddsCalculator;
