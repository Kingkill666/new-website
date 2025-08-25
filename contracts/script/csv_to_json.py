import csv
import json
import argparse

def is_valid_address(address):
    """Checks if a string is a valid Ethereum-style address."""
    return address.startswith('0x') and len(address) == 42

def convert_csv_to_json(input_file, output_file):
    """
    Reads a CSV file of token holders, extracts addresses from the first column,
    and writes them to a JSON array file.
    """
    holder_addresses = []
    
    try:
        with open(input_file, mode='r', encoding='utf-8') as infile:
            reader = csv.reader(infile)
            
            # Skip header if it exists by checking the first row
            first_row = next(reader)
            first_cell = first_row[0].strip().replace('"', '')
            if is_valid_address(first_cell):
                holder_addresses.append(first_cell)
            
            # Process the rest of the rows
            for row in reader:
                if not row:  # Skip empty rows
                    continue
                
                # Address is expected to be in the first column
                address = row[0].strip().replace('"', '')
                
                if is_valid_address(address):
                    holder_addresses.append(address)
                else:
                    print(f"Skipping invalid or malformed address: {address}")

        print(f"Found {len(holder_addresses)} valid holder addresses.")

        with open(output_file, 'w', encoding='utf-8') as outfile:
            json.dump(holder_addresses, outfile, indent=2)
        
        print(f"Successfully created '{output_file}' with {len(holder_addresses)} addresses.")

    except FileNotFoundError:
        print(f"Error: Input file not found at '{input_file}'")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    # Set up command-line argument parsing
    parser = argparse.ArgumentParser(
        description="Convert a CSV of token holders to a JSON array for Forge scripts."
    )
    parser.add_argument(
        "input_csv", 
        help="The path to the input CSV file downloaded from the explorer."
    )
    parser.add_argument(
        "-o", "--output", 
        default="holders.json", 
        help="The name of the output JSON file (default: holders.json)."
    )
    
    args = parser.parse_args()
    
    convert_csv_to_json(args.input_csv, args.output)
