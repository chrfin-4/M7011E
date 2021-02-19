export const powConv = (num) => {
  if (!num) return "0 kWh";
  if (Math.abs(num) >= 1000000000000) return (num / 1000000000000).toFixed(0) + " PWh";
  if (Math.abs(num) >= 1000000000) return (num / 1000000000).toFixed(0) + " TWh";
  if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(0) + " GWh";
  if (Math.abs(num) >= 1000) return (num / 1000).toFixed(0) + " MWh";
  if (Math.abs(num) == 0) return num.toFixed(0) + " kWh"
  return num.toFixed(0) + " kWh";
}
