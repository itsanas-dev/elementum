import re, os, sys, json, requests

ADD_SOURCE_IF_NOT_PRESENT = True
CHECK_SOURCE_DOMAIN_AVAILABILITY = True

def filter_disallowed_chars(text: str) -> str:
    return re.sub(r"[^\s\[\]'a-zA-Z0-9]", "", text)

def clean_electron_configuration(text: str) -> str:
  text = filter_disallowed_chars(text)
  by_whitespace = text.split()

  return ', '.join(by_whitespace)

def does_domain_exist(url: str) -> bool:
  res = requests.head(url)

  return res.ok

def main():
  argv = sys.argv

  if (len(argv) < 3):
    print(f"Usage: {os.path.basename(__file__)} <periodic_table.json> <output.json>")
    return

  file_name = argv[1]

  if (not os.path.exists(file_name)):
    print(f"No file with path \"{file_name}\" found.")
    return
  elif (os.path.isdir(file_name)):
    print(f"Path \"{file_name}\" provided is a directory.")
    return

  output_name = argv[-1]
  data = {}

  with open(file_name, "r", encoding="utf-8") as f:
    data = json.load(f)

  for k, element in data.items():
    if (k == "order"):
      continue

    if ("electron_configuration" not in element):
      continue

    electron_configuration = element["electron_configuration"]
    semantic_electron_config = element["electron_configuration_semantic"]

    element["electron_configuration"] = clean_electron_configuration(electron_configuration)
    element["electron_configuration_semantic"] = clean_electron_configuration(semantic_electron_config)

    if ("source" not in element and ADD_SOURCE_IF_NOT_PRESENT):
      url = f"https://en.wikipedia.org/wiki/{element["name"]}"

      if (CHECK_SOURCE_DOMAIN_AVAILABILITY and not does_domain_exist(url)):
        print(f"Domain for element \"{element["name"]}\" doesn't exist.")
        continue

      element["source"] = url

  with open(output_name, "w") as f:
    json.dump(data, f, indent=2)
  
if __name__ == "__main__":
  main()