from firebase import firebase

FBconn = firebase.FirebaseApplication(
    'https://class-presentation-79426-default-rtdb.europe-west1.firebasedatabase.app/', None)

documents = FBconn.get('/test', None)

data_dict = {}
for k, v in documents.items():
    docID_occurance_number = 0
    for docID in v['DocsIDs']:
        docID_occurance_number += docID['occuranceNumber']

    data_dict[v['Term']] = docID_occurance_number

data_dict = sorted(data_dict.items(), key=lambda x: x[1], reverse=True)
top_50_frequent = [x[0] for x in data_dict][0:50]

print(top_50_frequent)
