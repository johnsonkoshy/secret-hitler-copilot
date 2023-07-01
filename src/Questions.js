import React, { useState, useEffect } from "react";
const FASCIST = "fascist";
const LIBERAL = "liberal";
const GameWizard = () => {
  const [cardsInDeck, setCardsInDeck] = useState({
    [FASCIST]: 11,
    [LIBERAL]: 6
  });
  const [playedCard, setPlayedCard] = useState(null);
  const [presidentDiscard, setPresidentDiscard] = useState(null);
  const [chancellorDiscard, setChancellorDiscard] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [step, setStep] = useState(0);
  const [isInStep, setIsInStep] = useState(0);
  const [currGovt, setCurrGovt] = useState([]);
  const [totalPlayers, setTotalPlayers] = useState(7);

  const playCard = (type, nextStep, by, setIsInStep) => {
    setCardsInDeck({ ...cardsInDeck, [type]: cardsInDeck[type] - 1 });
    setPlayedCard(type);
    setStep(1);
    setIsInStep(true);
  };

  const discardCard = (type, nextStep, by, setIsInStep) => {
    setCardsInDeck({ ...cardsInDeck, [type]: cardsInDeck[type] - 1 });
    by(type);
    setStep(nextStep + 1);
    if (nextStep + 1 === 3) {
      setIsInStep(false);
    }
  };
  const onSkip = (nextStep) => {
    setStep(nextStep + 1);
  };
  const endRound = () => {
    const roundOdds = odds(
      cardsInDeck,
      playedCard,
      presidentDiscard,
      chancellorDiscard
    );
    const cardsInDeckUnlinked = JSON.parse(JSON.stringify(cardsInDeck));
    setRounds([
      ...rounds,
      {
        playedCard,
        presidentDiscard,
        chancellorDiscard,
        odds: roundOdds,
        cardsInDeckUnlinked,
        currGovt
      }
    ]);
    setPlayedCard(null);
    setPresidentDiscard(null);
    setChancellorDiscard(null);
    setStep(0);
    setCurrGovt([]);
  };
  const steps = [
    {
      question: "Which card was played?",
      onChoose: playCard
    },
    {
      question: "What do you believe did the Chancellor discard?",
      onChoose: discardCard,
      by: setChancellorDiscard,
      onSkip
    },
    {
      question: "What do you believe did the President discard?",
      onChoose: discardCard,
      by: setPresidentDiscard,
      onSkip
    }
  ];

  const calcOverallConfidence = () => {
    if (rounds.length === 0) return 0;
    const sumUpOdds =
      rounds.reduce((acc, c) => (acc += c.odds), 0) / rounds.length;
    const defaultOdds = 6 / 11;
    const oddsWithDefaultOdds = sumUpOdds / defaultOdds;
    // const oddsOfHalf = oddsWithDefaultOdds / 0.7;
    return formatPercentage(oddsWithDefaultOdds);
  };

  return (
    <div className="main">
      <h1>Secret Hitler CoPilot</h1>
      <TotalPlayersModal setTotalPlayers={setTotalPlayers} />
      <Picker
        numberOfPlayers={totalPlayers}
        reset={!isInStep}
        setCurrGovt={setCurrGovt}
        rounds={rounds}
      />
      <div>
        <h4>Round {rounds.length + 1}</h4>
        {step < steps.length && (
          <GameQuestion
            question={steps[step].question}
            onChoose={steps[step].onChoose}
            by={steps[step].by}
            step={step}
            setIsInStep={setIsInStep}
            setCurrGovt={setCurrGovt}
            onSkip={steps[step].onSkip}
          />
        )}
        {step === steps.length && endRound()}
      </div>
      <DeckStatus
        setCardsInDeck={setCardsInDeck}
        cardsInDeck={cardsInDeck}
        rounds={rounds}
        isInStep={isInStep}
      />

      <div>
        <br />
        <div>Integrity: {calcOverallConfidence()}</div>

        {rounds
          .slice()
          .reverse()
          .map((round, index) => (
            <Round
              key={index}
              roundNumber={rounds.length - index}
              round={round}
            />
          ))}
      </div>
    </div>
  );
};

export default GameWizard;

function odds(cardsInDeck, playedCard, presidentDiscard, chancellorDiscard) {
  const currRound = [playedCard, presidentDiscard, chancellorDiscard];
  const totalCards =
    cardsInDeck[FASCIST] + cardsInDeck[LIBERAL] + currRound.length;
  const totalCombinations = combination(totalCards, 3);

  let claimedFascistCards = 0;
  if (playedCard === FASCIST) claimedFascistCards++;
  if (presidentDiscard === FASCIST) claimedFascistCards++;
  if (chancellorDiscard === FASCIST) claimedFascistCards++;

  const fascistCombinations = combination(
    cardsInDeck[FASCIST] + currRound.filter((c) => c === FASCIST).length,
    claimedFascistCards
  );
  const liberalCombinations = combination(
    cardsInDeck[LIBERAL] + currRound.filter((c) => c === LIBERAL).length,
    3 - claimedFascistCards
  );

  return (fascistCombinations * liberalCombinations) / totalCombinations;
}

function combination(n, r) {
  if (n < r) return 0;
  let answer = 1;
  for (let i = 0; i < r; i++) {
    answer *= (n - i) / (i + 1);
  }
  return answer;
}

function Round({ roundNumber, round }) {
  const abbriviate = (word) => {
    if (word && word.length) return word[0].toUpperCase();
    return word;
  };
  const showGovt = (round) => {
    if (round.currGovt.length > 1)
      return `${round.currGovt[0]} - ${round.currGovt[1]}`;
    return "";
  };
  const hasConflict = (round) => {
    const discardedLiberal = round.chancellorDiscard === LIBERAL;
    const didPlayLiberal = round.playedCard === LIBERAL;
    if (didPlayLiberal) return "";

    if (!didPlayLiberal && discardedLiberal) return "| C";
  };
  return (
    <div>
      <h4 className={`round ${round.playedCard}`}>
        Round {roundNumber} - {abbriviate(round.playedCard)}
        {abbriviate(round.chancellorDiscard)}
        {abbriviate(round.presidentDiscard)} | {formatPercentage(round.odds)} |{" "}
        {round.cardsInDeckUnlinked.fascist + round.cardsInDeckUnlinked.liberal}{" "}
        | {round.currGovt.length && showGovt(round)} {hasConflict(round)}
      </h4>
    </div>
  );
}

function GameQuestion({
  question,
  onChoose,
  step,
  by,
  setIsInStep,
  setCurrGovt,
  onSkip
}) {
  return (
    <>
      <p>{question}</p>
      <CardChoice
        onChoose={onChoose}
        step={step}
        by={by}
        setIsInStep={setIsInStep}
        setCurrGovt={setCurrGovt}
        onSkip={onSkip}
      />
    </>
  );
}
function CardChoice({ onChoose, step, by, setIsInStep, setCurrGovt, onSkip }) {
  return (
    <>
      <button
        className="policyBtn liberal"
        onClick={() => onChoose(LIBERAL, step, by, setIsInStep, setCurrGovt)}
      >
        Liberal
      </button>
      <button
        className="policyBtn fascist"
        onClick={() => onChoose(FASCIST, step, by, setIsInStep, setCurrGovt)}
      >
        Fascist
      </button>
      {onSkip ? (
        <button className="skipBtn" onClick={() => onSkip(step)}>
          Skip - Top Deck
        </button>
      ) : null}
    </>
  );
}

function DeckStatus({ setCardsInDeck, cardsInDeck, rounds, isInStep }) {
  const totalInDeck = cardsInDeck[FASCIST] + cardsInDeck[LIBERAL];
  const isLessThan3 = totalInDeck < 3;
  if (isLessThan3 && !isInStep) {
    const roundwCurr = rounds.filter((r, i, arr) => {
      if (arr.length < 6) return true;
      if (i >= 6) {
        return true;
      }
      return false;
    });
    const discards = [
      ...roundwCurr.map((r) => r.presidentDiscard),
      ...roundwCurr.map((r) => r.chancellorDiscard)
    ];
    const libCards =
      discards.filter((d) => d === LIBERAL).length + cardsInDeck[LIBERAL];
    const fasCards =
      discards.filter((d) => d === FASCIST).length + cardsInDeck[FASCIST];

    setCardsInDeck({ fascist: fasCards, liberal: libCards });
  }
  return (
    <div>
      <h3>Deck</h3>
      <p>
        <span className="deck liberal">
          {" "}
          {cardsInDeck[LIBERAL]} {LIBERAL}
        </span>{" "}
        <span className="deck fascist">
          {" "}
          {cardsInDeck[FASCIST]} {FASCIST}
        </span>{" "}
      </p>
    </div>
  );
}

const formatPercentage = (value) => {
  return `${(value * 100).toFixed(2)}%`;
};

const Picker = ({ numberOfPlayers, reset, setCurrGovt, rounds }) => {
  const [selected, setSelected] = useState([]);
  const [govt, setGovt] = useState();

  useEffect(() => {
    if (reset) {
      setSelected([]);
    }
    if (rounds.length) {
      console.log(rounds);
      setGovt(rounds.map((r) => ({ g: r.currGovt, c: r.playedCard })));
    }
  }, [reset, rounds]);
  const matchPlayedRecord = (player, isStyle = false) => {
    const played = rounds.filter((r) => r.currGovt.includes(player));
    const libGov = played.filter((r) => r.playedCard === LIBERAL);
    const fasGov = played.filter((r) => r.playedCard === FASCIST);
    const libGovCount = libGov.length;
    const fasGovCount = fasGov.length;
    if (libGovCount && fasGovCount) {
      if (isStyle) {
        const integrity =
          played.reduce((acc, c) => (acc += c.odds), 0) / played.length;
        const ratio = libGovCount / (libGovCount + fasGovCount);
        const score = (integrity + ratio) / 2;
        return `linear-gradient(to top, #48b0da ${score * 100}%,#f04e1c 0%)`;
      }
      return "";
    }
    let formClass = "";
    if (libGovCount) {
      formClass = LIBERAL;
    }
    if (fasGovCount) {
      formClass = FASCIST;
    }
    return formClass;
  };
  const handleClick = (player) => {
    let finalSelected;
    if (selected.includes(player)) {
      finalSelected = selected.filter((s) => s !== player);
      setSelected(selected.filter((s) => s !== player));
    } else if (selected.length < 2) {
      finalSelected = [...selected, player];
    } else if (selected.length >= 2) {
      finalSelected = [player];
    }
    setSelected(finalSelected);
    setCurrGovt(finalSelected);
  };

  const showGovtSelection = (player) => {
    if (selected.length && selected[0] === player) {
      return "P";
    }
    if (selected.length && selected[1] === player) {
      return "C";
    }
    return "";
  };

  const calcWidth = () => {
    const width = 100 / numberOfPlayers;
    return width - 1;
  };
  return (
    <div>
      <h4>Goverment</h4>
      {Array.from({ length: numberOfPlayers }, (_, i) => i + 1).map(
        (player) => (
          <button
            className={`playersBtn 
              ${selected.includes(player) ? "selected" : ""}
              ${matchPlayedRecord(player)}
            `}
            key={player}
            onClick={() => handleClick(player)}
            style={{
              background: matchPlayedRecord(player, true),
              width: `${calcWidth()}%`
            }}
          >
            <div>{player}</div>
            <div className="govtOfficial">{showGovtSelection(player)}</div>
          </button>
        )
      )}
    </div>
  );
};

const TotalPlayersModal = ({ setTotalPlayers }) => {
  // State for the number of players
  const [numPlayers, setNumPlayers] = useState(7);
  const [hideModalCl, setHideModalCl] = useState("");
  // Function to increase the number of players
  const increaseNumPlayers = () => {
    if (numPlayers < 10) setNumPlayers(numPlayers + 1);
  };

  // Function to decrease the number of players
  const decreaseNumPlayers = () => {
    if (numPlayers > 5) setNumPlayers(numPlayers - 1);
  };

  // Function to determine the party membership based on the number of players
  const getSplit = () => {
    if (numPlayers <= 6) {
      let liberals = 3,
        fascists = 2;

      if (numPlayers > liberals + fascists) liberals += 1;
      return { liberals, fascists };
    }
    if (numPlayers <= 8) {
      let liberals = 4,
        fascists = 3;

      if (numPlayers > liberals + fascists) liberals += 1;
      return { liberals, fascists };
    }
    if (numPlayers <= 10) {
      let liberals = 5,
        fascists = 4;

      if (numPlayers > liberals + fascists) liberals += 1;
      return { liberals, fascists };
    }
  };

  const split = getSplit();

  const onSetPlayersBtn = () => {
    setTotalPlayers(numPlayers);
    setHideModalCl("hidden");
  };
  return (
    <div className={`modal ${hideModalCl}`}>
      <div className="modal-content">
        <h2>Players</h2>
        <h2> {numPlayers}</h2>
        <button className="removePlayerBtn" onClick={decreaseNumPlayers}>
          -
        </button>
        <button className="addPlayerBtn" onClick={increaseNumPlayers}>
          +
        </button>

        <p className="playerSplit ">
          Liberals: <span className=" liberal"> {split.liberals}</span>
        </p>
        <p className="playerSplit">
          Fascists: <span className=" fascist"> {split.fascists}</span>
        </p>

        <button className="setPlayerBtn" onClick={onSetPlayersBtn}>
          Continue
        </button>
      </div>
    </div>
  );
};
