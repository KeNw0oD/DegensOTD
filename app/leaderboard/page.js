export default function LeaderboardPage() {
  const top3 = [
    { place: 1, name: "Pep***", wager: 120200.33, prize: 1500 },
    { place: 2, name: "JMR***", wager: 103624.31, prize: 600 },
    { place: 3, name: "yob***", wager: 98765.43, prize: 300 },
  ];

  const others = [
    { place: 4, name: "Twenty4", wager: 70070.07, prize: 150 },
    { place: 5, name: "Twenty5", wager: 69069.07, prize: 125 },
    { place: 6, name: "Twenty6", wager: 68068.07, prize: 75 },
    { place: 7, name: "Twenty7", wager: 67067.07, prize: 75 },
    { place: 8, name: "Twenty8", wager: 66066.07, prize: 50 },
    { place: 9, name: "Twenty9", wager: 65065.07, prize: 50 },
    { place: 10, name: "Twenty10", wager: 64064.07, prize: 25 },
    { place: 11, name: "Twenty11", wager: 63063.07, prize: 25 },
    { place: 12, name: "Twenty12", wager: 62062.07, prize: 25 },
    { place: 12, name: "Twenty12", wager: 62062.07, prize: 25 },
    { place: 12, name: "Twenty12", wager: 62062.07, prize: 25 },
    { place: 12, name: "Twenty12", wager: 62062.07, prize: 25 },
    { place: 12, name: "Twenty12", wager: 62062.07, prize: 25 },
  ];

  return (
    <div className="leaderboard">
      {/* Заголовок */}
      <div className="leaderboard-header">
        <h1>$3,000 Monthly Leaderboard</h1>
        <p>Payout in <span>17 Days 16 Hours 58 Minutes 17 Seconds</span></p>
      </div>

        <div className="top-three">

        {/* 2 место */}
        <div className="top-card silver">
        <div className="card-header">2nd Place</div>
        <div className="card-body medal-left">
            <img src="/medals/silver.png" alt="Silver Medal" className="medal" />
            <div className="text-block">
            <div className="name">{top3[1].name}</div>
            <div className="wager">${top3[1].wager.toLocaleString()}</div>
            <div className="prize">${top3[1].prize} Prize</div>
            </div>
        </div>
        </div>
        {/* 1 место */}
        <div className="top-card gold leader-card">
        <div className="card-header">Leader</div>
        <div className="card-body">
            <img src="/medals/gold.png" alt="Gold Medal" className="medal" />
            <div className="name">{top3[0].name}</div>
            <div className="wager">${top3[0].wager.toLocaleString()}</div>
            <div className="prize">${top3[0].prize} Prize</div>
        </div>
        </div>

        {/* 3 место */}
        <div className="top-card bronze">
        <div className="card-header">3rd Place</div>
        <div className="card-body medal-right">
            <div className="text-block">
            <div className="name">{top3[2].name}</div>
            <div className="wager">${top3[2].wager.toLocaleString()}</div>
            <div className="prize">${top3[2].prize} Prize</div>
            </div>
            <img src="/medals/bronze.png" alt="Bronze Medal" className="medal" />
        </div>
        </div>


        </div>


        {/* Таблица */}
        <div className="leaderboard-wrapper">
        {/* Отдельный фиксированный заголовок */}
        <table className="leaderboard-header-row">
            <thead>
            <tr>
                <th>USERNAME</th>
                <th>WAGER</th>
                <th>PRIZE</th>
            </tr>
            </thead>
        </table>

        {/* Прокручиваемое тело */}
        <div className="leaderboard-scroll">
            <table className="leaderboard-table">
            <tbody>
                {others.map((player) => (
                <tr>
                <td>#{player.place}</td>
                <td>{player.name}</td>
                <td>${player.wager.toLocaleString()}</td>
                <td>${player.prize}</td>
                </tr>

                ))}
            </tbody>
            </table>
        </div>
        </div>



      {/* Кнопка */}
      <div className="cta">
        <button>Join the race now!</button>
      </div>
    </div>
  );
}
