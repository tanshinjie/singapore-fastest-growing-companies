import os
import re
import pandas as pd
from bs4 import BeautifulSoup

def extract_website(text):
    if not isinstance(text, str):
        return ''
    # Extract href from HTML link
    soup = BeautifulSoup(text, 'html.parser')
    link = soup.find('a')
    if link and 'href' in link.attrs:
        return link['href']
    return text if 'http' in str(text) else ''

def clean_html(text):
    if not isinstance(text, str):
        return text
    # Remove HTML tags and extract text
    soup = BeautifulSoup(text, 'html.parser')
    return soup.get_text()

def clean_currency(value):
    if not isinstance(value, str):
        return value
    # Remove currency symbols and commas, convert to float
    value = str(value).replace('$', '').replace(',', '')
    try:
        return float(value)
    except ValueError:
        return value

def clean_percentage(value):
    if not isinstance(value, str):
        return value
    # Remove % symbol and convert to float
    value = str(value).replace('%', '').replace(',', '')
    try:
        return float(value)
    except ValueError:
        return value

def clean_column_name(col):
    # First remove the ^(in %)^ or ^(in SGD)^ patterns
    col = re.sub(r'\^\([^)]+\)\^', '', col)
    # Remove all asterisks
    col = col.replace('**', '')
    # Remove any remaining special characters and trim
    col = col.strip()
    return col

def standardize_csv(file_path):
    # Read CSV file with tab delimiter for 2025.csv
    if file_path.endswith('2025.csv'):
        df = pd.read_csv(file_path, sep='\t')
    else:
        try:
            df = pd.read_csv(file_path, sep=',')
        except:
            df = pd.read_csv(file_path, sep='\t')
    
    # Clean up column names
    df.columns = [clean_column_name(col) for col in df.columns]
    
    # Extract website and clean company name
    if 'Name' in df.columns:
        # Preserve existing website data if column exists
        if 'Website' not in df.columns:
            df['Website'] = ''
        
        # Only extract from Name if Website is empty
        mask = df['Website'].isna() | (df['Website'] == '')
        df.loc[mask, 'Website'] = df.loc[mask, 'Name'].apply(extract_website)
        
        # Clean company name
        df['Name'] = df['Name'].apply(clean_html)
    
    # Clean currency values
    revenue_columns = [col for col in df.columns if 'Revenue' in col]
    for col in revenue_columns:
        df[col] = df[col].apply(clean_currency)
    
    # Clean percentage values
    growth_columns = [col for col in df.columns if 'growth rate' in col.lower()]
    for col in growth_columns:
        df[col] = df[col].apply(clean_percentage)
    
    # Sort by rank
    if 'Rank' in df.columns:
        df = df.sort_values('Rank')
    
    # Save standardized CSV
    output_path = file_path.replace('.csv', '_standardized.csv')
    df.to_csv(output_path, index=False)
    return output_path

def main():
    data_dir = '/Users/shinjie/shinjie-workspace/singapore-fastest-growing-companies-2024/data'
    
    # Process all CSV files in the data directory
    for filename in os.listdir(data_dir):
        if filename.endswith('.csv') and not filename.endswith('_standardized.csv'):
            file_path = os.path.join(data_dir, filename)
            print(f'Standardizing {filename}...')
            output_path = standardize_csv(file_path)
            print(f'Saved standardized file to {output_path}')

if __name__ == '__main__':
    main()