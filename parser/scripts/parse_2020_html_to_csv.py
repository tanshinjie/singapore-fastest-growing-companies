import json
import re
import csv

def extract_name_and_url(cell_content):
    # Corrected regex to handle single or double quotes around href, or no quotes
    match = re.search(r'<a href=["\\]?["\\]?(.*?)["\\]?["\\]?>(.*?)</a>', cell_content)
    if match:
        url = match.group(1).strip()
        name = match.group(2).strip()
        # Remove any trailing / from the URL
        if url.endswith('/'):
            url = url[:-1]
        return name, url
    return cell_content, "" # Return original content and empty string if no link found

def parse_html_to_csv(html_file_path, output_csv_path):
    with open(html_file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    match = re.search(r'chartData: "([\s\S]*?)",\n', html_content)
    if not match:
        print("Could not find the chartData in the HTML file.")
        return

    csv_string = match.group(1)
    csv_string = csv_string.replace('\\t', '\t').replace('\\n', '\n')
    csv_string = csv_string.replace('\\/', '/') # Unescape forward slashes
    csv_string = csv_string.replace('&amp;', '&')
    csv_string = csv_string.replace('&lt;', '<')
    csv_string = csv_string.replace('&gt;', '>')
    csv_string = csv_string.replace('&quot;', '"')
    csv_string = csv_string.replace('&#39;', "'")

    lines = csv_string.strip().split('\n')
    
    if not lines:
        print("No data found to write to CSV.")
        return

    # Standardize headers for 2020 data
    standard_headers_2020 = [
        'Rank',
        'Name',
        'Website',
        'Sector',
        'Absolute growth rate (in %)',
        'Compound annual growth rate (CAGR) (in %)',
        'Revenue 2018 (in SGD)',
        'Revenue 2015 (in SGD)',
        'Number of employees 2018',
        'Number of employees 2015',
        'Founding year'
    ]
    processed_data = [standard_headers_2020]

    # Process data rows
    for line in lines[1:]:
        row = line.split('\t')
        if len(row) > 1: # Ensure row has at least 'Name' column
            name_cell = row[1]
            name, url = extract_name_and_url(name_cell)
            
            # Update the name in the row (remove HTML tags)
            row[1] = name
            # Insert the URL at index 2
            row.insert(2, url)
            
            # Remove the original 'Company name' column if it exists (now at index 3)
            if len(row) > 3: # Check if there are enough columns after insertion
                del row[3] # Remove the original 'Company name' column

            # Clean up HTML tags from all cells
            cleaned_row = [re.sub(r'<[^>]*>', '', cell).strip() for cell in row]
            processed_data.append(cleaned_row)
        else:
            # If a row doesn't have enough columns, just append it as is after cleaning
            processed_data.append([re.sub(r'<[^>]*>', '', cell).strip() for cell in row])


    with open(output_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerows(processed_data)
    print(f"Successfully parsed {html_file_path} and saved to {output_csv_path}")

if __name__ == "__main__":
    html_input_path = "/Users/shinjie/shinjie-workspace/singapore-fastest-growing-companies-2024/data/2020.html"
    csv_output_path = "/Users/shinjie/shinjie-workspace/singapore-fastest-growing-companies-2024/data/2020.csv"
    parse_html_to_csv(html_input_path, csv_output_path)