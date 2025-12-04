import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { useEffect } from 'react';

import './App.css';
import StatsPage from './pages/StatsPage';
import BooksPage from './pages/BooksPage';
import ReadersPage from './pages/ReadersPage';
import BorrowChart from './components/BorrowChart';
import { getHealth } from './api';

function App() {
  useEffect(() => {
    getHealth()
      .then((res) => {
        console.log("✅ Backend health:", res.data.ok);
      })
      .catch((error) => {
        console.error("❌ Lỗi gọi API:", error);
      });
  }, []);

  return (
    <div className="page-frame">
      <Router>
        <main style={{ padding: '1rem' }}>
          <Switch>
            {/* Redirect từ "/" sang "/stats" */}
            <Route exact path="/">
              <Redirect to="/stats" />
            </Route>

            {/* Các route chính */}
            <Route path="/stats" component={StatsPage} />
            <Route path="/books" component={BooksPage} />
            <Route path="/readers" component={ReadersPage} />
            <Route path="/borrows-chart" component={BorrowChart} />

            {/* Fallback cho route không tồn tại */}
            <Route path="*">
              <Redirect to="/stats" />
            </Route>
          </Switch>
        </main>
      </Router>
    </div>
  );
}

export default App;
