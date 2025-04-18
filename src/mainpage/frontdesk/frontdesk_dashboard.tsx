import React from "react";
import Header from "../components/frontdesk_header";
import AdminMenuComponent from "../components/frontdesk_menu";
import "./dashboard.css";

import RentCollected_Icon from "../assets/icons/rent_collected.png";
import OverdueIcon from "../assets/icons/overdue.png";
import Upcoming_Icon from "../assets/icons/upcoming_icon.png";
import Overdue_Icon from "../assets/icons/overdue_icon.png";

const Dashboard: React.FC = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="main-content-container">
        <AdminMenuComponent isOpen={false} setIsOpen={() => {}} />
        <div className="content-wrapper">
          <div className="dashboard-container">
            <h2 className="dashboard-title">Dashboard</h2>

            {/* Top Section */}
            <div className="top-section">
              {/* Left Side: Cards Column */}
              <div className="cards-column">
                {/* Financial Cards */}
                <div className="financial-cards">
                  {/* Rent Collected Card */}
                  <div className="card">
                    <p className="card-title">Rent Collected</p>
                    <div className="card-content">
                      <div className="card-icon document-icon">
                        <img
                          src={RentCollected_Icon}
                          alt="Rent Collected"
                          className="card-icon-image"
                        />
                      </div>
                      <p className="card-amount">₱6,000.00</p>
                    </div>
                  </div>

                  {/* Overdue Rent Card */}
                  <div className="card">
                    <p className="card-title">Overdue rent</p>
                    <div className="card-content">
                      <div className="card-icon warning-icon">
                        <img
                          src={OverdueIcon}
                          alt="Overdue Rent"
                          className="card-icon-image"
                        />
                      </div>
                      <p className="card-amount overdue">₱4,500.00</p>
                    </div>
                  </div>
                </div>

                {/* Units Cards */}
                <div className="units-cards">
                  {/* Available Units Card */}
                  <div className="card">
                    <p className="card-title">Available Units</p>
                    <div className="card-content units-card">
                      <p className="card-number">03</p>
                      <div className="circle-progress green"></div>
                    </div>
                  </div>

                  {/* Occupied Units Card */}
                  <div className="card">
                    <p className="card-title">Occupied Units</p>
                    <div className="card-content units-card">
                      <p className="card-number">07</p>
                      <div className="circle-progress blue"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Upcoming Rent Due Card */}
              <div className="upcoming-rent-card">
                <h3>Upcoming Rent Due</h3>
                <ul className="rent-list">
                  <li>
                    <div className="rent-item">
                      <div className="unit-icon">
                        <img
                          src={Upcoming_Icon}
                          alt="Upcoming"
                          className="unit-icon-image"
                        />
                      </div>
                      <div className="unit-details">
                        <p className="unit-number">Unit 202</p>
                        <p className="due-date">10/26/2024</p>
                      </div>
                      <div className="rent-amount">₱18,000</div>
                    </div>
                  </li>
                  <li>
                    <div className="rent-item">
                      <div className="unit-icon">
                        <img
                          src={Upcoming_Icon}
                          alt="Upcoming"
                          className="unit-icon-image"
                        />
                      </div>
                      <div className="unit-details">
                        <p className="unit-number">Unit 203</p>
                        <p className="due-date">10/26/2024</p>
                      </div>
                      <div className="rent-amount">₱18,000</div>
                    </div>
                  </li>
                  <li>
                    <div className="rent-item">
                      <div className="unit-icon">
                        <img
                          src={Upcoming_Icon}
                          alt="Upcoming"
                          className="unit-icon-image"
                        />
                      </div>
                      <div className="unit-details">
                        <p className="unit-number">Unit 204</p>
                        <p className="due-date">10/26/2024</p>
                      </div>
                      <div className="rent-amount">₱18,000</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="dashboard-bottom">
              {/* Recent Transactions */}
              <div className="transactions">
                <div className="transactions-header">
                  <h3>Recent Transactions</h3>
                  <a href="#" className="see-all-link">
                    See all →
                  </a>
                </div>
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Unit number</th>
                      <th>Payment</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>John Smith</td>
                      <td>203</td>
                      <td>₱18,000</td>
                      <td>09/26/2024</td>
                    </tr>
                    <tr>
                      <td>Nick Kha</td>
                      <td>201</td>
                      <td>₱17,500</td>
                      <td>09/22/2024</td>
                    </tr>
                    <tr>
                      <td>Lyra Shell</td>
                      <td>202</td>
                      <td>₱18,000</td>
                      <td>09/18/2024</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Overdue Tenants */}
              <div className="overdue-tenants-card">
                <h3>Overdue Tenants</h3>
                <ul className="rent-list">
                  <li>
                    <div className="rent-item">
                      <div className="unit-icon overdue">
                        <img
                          src={Overdue_Icon}
                          alt="Overdue"
                          className="unit-icon-image"
                        />
                      </div>
                      <div className="unit-details">
                        <p className="unit-number">Unit 202</p>
                        <p className="due-date">09/26/2024</p>
                      </div>
                      <div className="rent-amount">₱18,000</div>
                    </div>
                  </li>
                  <li>
                    <div className="rent-item">
                      <div className="unit-icon overdue">
                        <img
                          src={Overdue_Icon}
                          alt="Overdue"
                          className="unit-icon-image"
                        />
                      </div>
                      <div className="unit-details">
                        <p className="unit-number">Unit 203</p>
                        <p className="due-date">09/20/2024</p>
                      </div>
                      <div className="rent-amount">₱18,000</div>
                    </div>
                  </li>
                  <li>
                    <div className="rent-item">
                      <div className="unit-icon overdue">
                        <img
                          src={Overdue_Icon}
                          alt="Overdue"
                          className="unit-icon-image"
                        />
                      </div>
                      <div className="unit-details">
                        <p className="unit-number">Unit 204</p>
                        <p className="due-date">09/28/2024</p>
                      </div>
                      <div className="rent-amount">₱18,000</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
