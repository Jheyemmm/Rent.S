import React, { useEffect, useState } from "react";
import Header from "../../components/header";
import MenuComponent from "../../components/admin_menu";
import "./dashboard.css";
import RentCollected_Icon from "../../assets/icons/rent_collected.png";
import OverdueIcon from "../../assets/icons/overdue.png";
import Upcoming_Icon from "../../assets/icons/upcoming_icon.png";
import Overdue_Icon from "../../assets/icons/overdue_icon.png";
import supabase from "../../supabaseClient";

const Dashboard: React.FC = () => {
  const [availableCount, setAvailableCount] = useState<number>(0);
  const [occupiedCount, setOccupiedCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [upcomingRents, setUpcomingRents] = useState<any[]>([]);
  const [overdueRents, setOverdueRents] = useState<any[]>([]);
  const [rentAmounts, setRentAmounts] = useState<{collected: number, overdue: number}>({collected: 0, overdue: 0});
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const availablePercent = total ? (availableCount / total) * 100 : 0;
  const occupiedPercent = total ? (occupiedCount / total) * 100 : 0; 

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get all occupied units with their tenant information
        const { data: occupiedUnitsData, error: unitsError } = await supabase
          .from("Units")
          .select(`
            UnitID, 
            UnitNumber,
            Price,
            Tenants (
              TenantID,
              TenantFirstName,
              TenantLastName,
              MoveInDate,
              Balance
            )
          `)
          .eq("UnitStatus", "Occupied");

        if (unitsError) {
          console.error("Error fetching occupied units:", unitsError);
          // Show a user-friendly error message
          return;
        }

        // Calculate upcoming and overdue rent based on move-in date
        const today = new Date();
        const upcoming: any[] = [];
        const overdue: any[] = [];
        let totalCollected = 0;
        let totalOverdue = 0;

        // Get payment data to calculate collected rent
        const { data: paymentsData } = await supabase
          .from("Payments")
          .select("PaymentAmount")
          .gte("PaymentDate", new Date(today.getFullYear(), today.getMonth(), 1).toISOString());

        if (paymentsData) {
          totalCollected = paymentsData.reduce((sum, payment) => sum + payment.PaymentAmount, 0);
        }

        // Process each unit with tenant
        occupiedUnitsData?.forEach(unit => {
          if (!unit.Tenants || unit.Tenants.length === 0) return;
          
          // Access the first tenant in the array
          const tenant = unit.Tenants[0];
          const moveInDate = new Date(tenant.MoveInDate);
          
          // Calculate next due date (same day of month as move-in date)
          const nextDueDate = new Date();
          nextDueDate.setDate(moveInDate.getDate());
          
          // If already passed this month, set to next month
          if (nextDueDate < today) {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          }
          
          // Format for display
          const dueDateStr = nextDueDate.toLocaleDateString();
          
          // Check if overdue or upcoming
          const daysUntilDue = Math.floor((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          const rentInfo = {
            unitNumber: unit.UnitNumber,
            unitID: unit.UnitID,
            tenantName: `${tenant.TenantFirstName} ${tenant.TenantLastName}`,
            dueDate: dueDateStr,
            amount: unit.Price || 0,
            balance: tenant.Balance || 0
          };
          
          if (daysUntilDue < 0 || tenant.Balance > 0) {
            overdue.push(rentInfo);
            totalOverdue += tenant.Balance || unit.Price || 0;
          } else if (daysUntilDue <= 14) { // Show upcoming payments within next 14 days
            upcoming.push(rentInfo);
          }
        });

        // Sort by closest due date first
        upcoming.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        overdue.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        setUpcomingRents(upcoming);
        setOverdueRents(overdue);
        setRentAmounts({
          collected: totalCollected,
          overdue: totalOverdue
        });
        
        // Continue with your existing unit count fetch
        const { data, error } = await supabase.from("Units").select("UnitStatus");

        if (error) {
          console.error("Error fetching units:", error.message);
          // Show a user-friendly error message
          return;
        }

        const available = data.filter((u) => u.UnitStatus === "Available").length;
        const occupied = data.filter((u) => u.UnitStatus === "Occupied").length;

        setAvailableCount(available);
        setOccupiedCount(occupied);
        setTotal(data.length);

        // Fetch recent transactions
        await fetchRecentTransactions();

      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        // Show a user-friendly error message
        return;
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRecentTransactions = async () => {
      try {
        // Get basic payment data first
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("Payments")
          .select('PaymentID, PaymentAmount, PaymentDate, TenantID, UnitID')
          .order('PaymentDate', { ascending: false })
          .limit(3);
        
        if (paymentsError) {
          console.error('Error fetching payments:', paymentsError);
          return;
        }

        // Now fetch related data for each payment
        const formattedTransactions = await Promise.all(paymentsData.map(async (payment) => {
          // Get tenant data
          const { data: tenantData } = await supabase
            .from("Tenants")
            .select('TenantFirstName, TenantLastName')
            .eq('TenantID', payment.TenantID)
            .single();

          // Get unit data
          const { data: unitData } = await supabase
            .from("Units")
            .select('UnitNumber')
            .eq('UnitID', payment.UnitID)
            .single();

          return {
            id: payment.PaymentID,
            name: tenantData ? `${tenantData.TenantFirstName} ${tenantData.TenantLastName}` : 'Unknown',
            unitNumber: unitData?.UnitNumber || 'Unknown',
            amount: payment.PaymentAmount,
            date: new Date(payment.PaymentDate).toLocaleDateString()
          };
        }));

        setRecentTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error in transaction fetch:', error);
        return;
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="page-container">
      <Header />
      
      <div className="main-content-container">
        <MenuComponent isOpen={false} setIsOpen={() => {}} />
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
                      <p className="card-amount">₱{rentAmounts.collected.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
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
                      <p className="card-amount overdue">₱{rentAmounts.overdue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                  </div>
                </div>

                {/* Units Cards */}
                <div className="units-cards">
                  {/* Available Units Card */}
                  <div className="card">
                    <p className="card-title">Available Units</p>
                    <div className="card-content units-card">
                      <p className="card-number">{availableCount.toString().padStart(2, "0")}</p>
                      <div className="circle-progress" style={{'--progress': `${availablePercent}%`, "--fill-color": "#20c86e",} as React.CSSProperties}></div>
                    </div>
                  </div>

                  {/* Occupied Units Card */}
                  <div className="card">
                    <p className="card-title">Occupied Units</p>
                    <div className="card-content units-card">
                      <p className="card-number">{occupiedCount.toString().padStart(2, "0")}</p>
                      <div className="circle-progress" style={{'--progress': `${occupiedPercent}%`,"--fill-color": "#4361ee",} as React.CSSProperties}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Upcoming Rent Due Card */}
              <div className="upcoming-rent-card">
                <h3>Upcoming Rent Due</h3>
                <ul className="rent-list">
                  {isLoading ? (
                    <li className="loading-item">Loading upcoming payments...</li>
                  ) : upcomingRents.length === 0 ? (
                    <li className="empty-list-item">No upcoming payments due</li>
                  ) : (
                    upcomingRents.slice(0, 3).map((rent, index) => (
                      <li key={`upcoming-${index}`}>
                        <div className="rent-item">
                          <div className="unit-icon">
                            <img
                              src={Upcoming_Icon}
                              alt="Upcoming"
                              className="unit-icon-image"
                            />
                          </div>
                          <div className="unit-details">
                            <p className="unit-number">Unit {rent.unitNumber}</p>
                            <p className="due-date">{rent.dueDate}</p>
                          </div>
                          <div className="rent-amount">₱{rent.amount.toLocaleString()}</div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="dashboard-bottom">
              {/* Recent Transactions */}
              <div className="transactions">
                <div className="transactions-header">
                  <h3>Recent Transactions</h3>
                  <a href="/adminViewPayment" className="see-all-link">
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
                    {isLoading ? (
                      <tr><td colSpan={4}>Loading transactions...</td></tr>
                    ) : recentTransactions.length === 0 ? (
                      <tr><td colSpan={4}>No recent transactions</td></tr>
                    ) : (
                      recentTransactions.map((transaction, index) => (
                        <tr key={index}>
                          <td>{transaction.name}</td>
                          <td>{transaction.unitNumber}</td>
                          <td>₱{transaction.amount.toLocaleString()}</td>
                          <td>{transaction.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Overdue Tenants */}
              <div className="overdue-tenants-card">
                <h3>Overdue Tenants</h3>
                <ul className="rent-list">
                  {isLoading ? (
                    <li className="loading-item">Loading overdue payments...</li>
                  ) : overdueRents.length === 0 ? (
                    <li className="empty-list-item">No overdue payments</li>
                  ) : (
                    overdueRents.slice(0, 3).map((rent, index) => (
                      <li key={`overdue-${index}`}>
                        <div className="rent-item">
                          <div className="unit-icon overdue">
                            <img
                              src={Overdue_Icon}
                              alt="Overdue"
                              className="unit-icon-image"
                            />
                          </div>
                          <div className="unit-details">
                            <p className="unit-number">Unit {rent.unitNumber}</p>
                            <p className="due-date">{rent.dueDate}</p>
                          </div>
                          <div className="rent-amount">₱{rent.balance > 0 ? rent.balance.toLocaleString() : rent.amount.toLocaleString()}</div>
                        </div>
                      </li>
                    ))
                  )}
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
