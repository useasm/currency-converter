import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowDownUp, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// Popular currencies
const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
];

// Mock exchange rates (in a real app, this would come from an API)
const mockExchangeRates: { [key: string]: number } = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  MXN: 17.08,
};

export function CurrencyConverter() {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const calculateConversion = () => {
    const amountNum = parseFloat(amount) || 0;
    const fromRate = mockExchangeRates[fromCurrency];
    const toRate = mockExchangeRates[toCurrency];
    const rate = toRate / fromRate;
    
    setExchangeRate(rate);
    setConvertedAmount(amountNum * rate);
  };

  useEffect(() => {
    calculateConversion();
  }, [amount, fromCurrency, toCurrency]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleRefreshRates = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLastUpdated(new Date());
      calculateConversion();
      setIsLoading(false);
    }, 500);
  };

  const formatCurrency = (value: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6 shadow-xl dark:bg-gray-800 dark:border-gray-700">
        <div className="space-y-6">
          {/* From Currency */}
          <div className="space-y-2">
            <Label htmlFor="from-amount" className="dark:text-gray-200">
              Amount
            </Label>
            <div className="flex gap-3">
              <Input
                id="from-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter amount"
              />
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="w-[180px] dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {currencies.map((currency) => (
                    <SelectItem
                      key={currency.code}
                      value={currency.code}
                      className="dark:text-white dark:focus:bg-gray-600"
                    >
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapCurrencies}
              className="rounded-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              <ArrowDownUp className="h-5 w-5" />
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <Label htmlFor="to-currency" className="dark:text-gray-200">
              Converted Amount
            </Label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  id="to-currency"
                  type="text"
                  value={formatCurrency(convertedAmount, toCurrency)}
                  readOnly
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-12"
                />
              </div>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-[180px] dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {currencies.map((currency) => (
                    <SelectItem
                      key={currency.code}
                      value={currency.code}
                      className="dark:text-white dark:focus:bg-gray-600"
                    >
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exchange Rate Info */}
          <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Exchange Rate
                </span>
              </div>
              <Badge variant="secondary" className="dark:bg-gray-600 dark:text-white">
                1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshRates}
                disabled={isLoading}
                className="dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Conversion Reference */}
      <Card className="mt-6 p-4 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="mb-3 text-gray-900 dark:text-white">Quick Reference</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 10, 100, 1000].map((value) => {
            const converted = value * exchangeRate;
            return (
              <div
                key={value}
                className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-center"
              >
                <div className="text-gray-600 dark:text-gray-400">
                  {value} {fromCurrency}
                </div>
                <div className="text-gray-900 dark:text-white">
                  {formatCurrency(converted, toCurrency)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
