import csv

class badgeInfoFileRead():
    def fileRead(self):
        filename = '/Users/isa14/Downloads/badgeInfo.csv';

        with open(filename) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',');
            line_count = 0;
            bagdeInfoList = []; #will store the rows and will return this list of dictionaries to the server
            for row in csv_reader:
                dict = {};
                if line_count == 0:
                    #print(f'Column names are {", ".join(row)}');
                    line_count += 1;
                else:
                    dict['characteristic'] = row[0];
                    dict['value'] = row[1];
                    dict['badge_name'] = row[2];
                    dict['index'] = row[3];
                    dict['platform'] = row[4];
                    dict['imgName'] = row[5];
                    dict['definition'] = row[6];
                    dict['badge_prompt'] = row[7];
                    dict['badge_ss1'] = row[8];
                    dict['badge_ss2'] = row[9];
                    dict['badge_ss3'] = row[10];
                    #print(dict);

                    bagdeInfoList.append(dict);
                    line_count += 1;

        #print(bagdeInfoList)
        #print(len(bagdeInfoList));

        return bagdeInfoList;


if __name__ == "__main__":
    badgeInfoFileRead.fileRead(None)