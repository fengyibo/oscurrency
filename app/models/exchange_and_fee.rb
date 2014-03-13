class ExchangeAndFee < Exchange
  after_create :withdraw_fee
  validate :customer_has_enough_money?
  
  # For validation in user panel use default params,
  # when asked from admin use admin's params.
  def customer_has_enough_money?
    customers_account = self.customer.account(self.group)
    return true if customers_account.credit_limit.nil? #unlimited credit limit
    balance_after_exchange = customers_account.balance - self.amount
    # Can pay or can take enough credit to pay
    if balance_after_exchange >= 0 && balance_after_exchange.abs >= customers_account.credit_limit
      true
    else
      errors.add(:base, "You don't have enough money to pay this offer.")
      false
    end
  end
  
  private

  def withdraw_fee
    group.accounts.where(reserve: true).each do |a|
      e=group.exchanges.build(amount: amount*a.reserve_percent)
      e.metadata = metadata
      e.customer = worker
      e.worker = a.person
      e.save!
    end
  end
  
end
