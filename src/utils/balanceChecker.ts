import supabase from "../supabaseClient"

// Track if we've already run the balance check today to avoid multiple updates
let lastCheckedDate: string | null = null

/**
 * Checks all tenants to see if their monthly rent needs to be added to their balance
 * This should be called when the application initializes or when navigating pages
 */
export async function checkAllTenantBalances() {
  try {
    const today = new Date()
    const todayFormatted = today.toISOString().split('T')[0]
    
    if (lastCheckedDate === todayFormatted) {
      console.log("Already checked tenant balances today")
      return
    }
    
    console.log("Running tenant balance check for all tenants...")
    
    const { data: tenants, error: tenantsError } = await supabase
      .from("Tenants")
      .select(`
        TenantID,
        MoveInDate,
        Balance,
        UnitID
      `)
      .is("MoveOutDate", null) // Only check active tenants
    
    if (tenantsError) {
      console.error("Error fetching tenants for balance check:", tenantsError)
      return
    }
    
    // Get all units to get their prices
    const { data: units, error: unitsError } = await supabase
      .from("Units")
      .select("UnitID, Price")
    
    if (unitsError) {
      console.error("Error fetching units for balance check:", unitsError)
      return
    }
    
    // Create a lookup map for unit prices
    const unitPrices = new Map(units.map(unit => [unit.UnitID, unit.Price]))
    
    let updatedCount = 0
    
    // Check each tenant
    for (const tenant of tenants) {
      const unitPrice = unitPrices.get(tenant.UnitID) || 0
      if (unitPrice <= 0) {
        console.warn(`Unit price is zero for tenant ${tenant.TenantID}, skipping balance check`)
        continue
      }
      
      const moveInDate = new Date(tenant.MoveInDate)
      
      // Get the billing day from move-in date
      const billingDay = moveInDate.getDate()
      
      // Find the most recent billing date that has passed
      let lastBillingDate = new Date(today.getFullYear(), today.getMonth(), billingDay)
      
      // If the billing date hasn't occurred yet this month, use previous month's date
      if (today.getDate() < billingDay) {
        lastBillingDate.setMonth(lastBillingDate.getMonth() - 1)
      }
      
      // Find most recent payment to estimate when rent was last added
      const { data: recentPayments, error: paymentError } = await supabase
        .from("Payments")
        .select("PaymentDate")
        .eq("TenantID", tenant.TenantID)
        .order("PaymentDate", { ascending: false })
        .limit(10)
      
      if (paymentError) {
        console.error(`Error fetching payments for tenant ${tenant.TenantID}:`, paymentError)
        continue
      }
      
      // Check if we need to add rent
      let shouldAddRent = false
      
      if (recentPayments && recentPayments.length > 0) {
        // Get the last payment date
        const lastPaymentDate = new Date(recentPayments[0].PaymentDate)
        
        // Find the billing date for the month of the last payment
        const lastPaymentBillingDate = new Date(
          lastPaymentDate.getFullYear(),
          lastPaymentDate.getMonth(),
          billingDay
        )
        
        // If last payment was before the most recent billing date,
        // we need to add rent to the balance
        shouldAddRent = lastBillingDate > lastPaymentBillingDate
      } else {
        // If no payment history, check if it's been at least one month since move-in
        shouldAddRent = today >= new Date(moveInDate.getFullYear(), moveInDate.getMonth() + 1, moveInDate.getDate())
      }
      
      if (shouldAddRent) {
        // Add one month's rent to the balance
        const newBalance = (tenant.Balance || 0) + unitPrice
        
        const { error: updateError } = await supabase
          .from("Tenants")
          .update({ Balance: newBalance })
          .eq("TenantID", tenant.TenantID)
        
        if (updateError) {
          console.error(`Error updating balance for tenant ${tenant.TenantID}:`, updateError)
        } else {
          console.log(`Added monthly rent of ${unitPrice} to tenant ${tenant.TenantID}, new balance: ${newBalance}`)
          updatedCount++
        }
      }
    }
    
    // Remember that we've checked balances today
    lastCheckedDate = todayFormatted
    console.log(`Balance check complete. Updated ${updatedCount} tenant balances.`)
    
    return updatedCount
  } catch (err) {
    console.error("Error in checkAllTenantBalances:", err)
  }
}

export {}