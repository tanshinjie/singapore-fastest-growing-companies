# Singapore's Fastest Growing Companies

This project visualizes and analyzes the growth of companies in Singapore over recent years. It includes data processing scripts, standardized CSV data, and a dashboard built with React and Vite.

## Features

- **CSV Data Standardization**: Scripts to clean and standardize company growth data.
- **Interactive Dashboard**: A React-based front-end for visualizing company growth metrics.
- **Data Visualization**: Various charts and tables to explore growth rates, sector distributions, and more.
- **File Upload & Export**: Upload new datasets and export filtered information.

## Project Structure

- **/bolt**: Source code for the React-based dashboard (generated by Bolt AI agent).
- **/data**: Contains pre-processed CSV files for each year.
- **/parser**: Scripts for data parsing and standardization.
- **/replit**: Source code generated by Replit AI agent.

## Getting Started

### Prerequisites

- Node.js and npm installed
- Python installed (for script execution)

### Installation

1. Clone the repository.
2. Navigate to the `/bolt` directory and run:
   ```bash
   npm install
   ```

3. Navigate to the `/replit` directory and run:
   ```bash
   npm install
   ```

### Running the Development Server

To start the development server for the dashboard:

```bash
cd bolt
npm run dev
```

### Data Standardization

You can standardize new or existing CSV datasets using:

```bash
cd parser/scripts
python standardize_csv.py
```

### Dashboard Features

- **Visualize Top Companies**: Analyze the fastest growing companies using bar charts.
- **Explore Sector Growth**: Visualize sector distribution and recurring companies.
- **Custom Filters**: Filter data by year, sector, and growth metrics.

## Data Sources

- 2020: [Link](https://datawrapper.dwcdn.net/wEwEU/14)
- 2021: [Link](https://datawrapper.dwcdn.net/otUAZ/15)
- 2022: Available locally
- 2023: Available locally
- 2024: Available locally
- 2025: Available locally

## Contributing

Feel free to submit issues, fork the repository, and send pull requests!

## License

MIT License
