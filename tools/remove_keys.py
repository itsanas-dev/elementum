import sys, os
import json

def main():
  argv = sys.argv

  if (len(argv) < 4):
    print(f"Usage: {os.path.basename(__file__)} <periodic_table.json> <entry1> <entry2> <output.json>")
    return

  file_name = argv[1]

  if (not os.path.exists(file_name)):
    print(f"No file with path \"{file_name}\" found.")
    return
  elif (os.path.isdir(file_name)):
    print(f"Path \"{file_name}\" provided is a directory.")
    return

  output_name = argv[-1]
  keys = set(argv[2:len(argv)-1])
  data = {}

  with open(file_name, "r", encoding="utf-8") as f:
    data = json.load(f)
  
  filtered_data = {}

  for k, element in data.items():
    if (k == "order"):
      filtered_data[k] = element
      continue

    filtered_element = {key: value for key, value in element.items() if key not in keys}
    filtered_data[k] = filtered_element
  
  with open(output_name, "w", encoding="utf-8") as f:
    json.dump(filtered_data, f, indent=2)

if (__name__ == "__main__"):
  main()