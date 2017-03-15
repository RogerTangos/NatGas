import requests


class DataHub(object):
    """
    Convenience class for connecting to DataHub's REST API.

    To use, register a client app at
    https://datahub.csail.mit.edu/oauth2/applications/register/ with
    the client type "confidential", authorization grant type "password", and
    no redirect URIs.
    """

    def __init__(self, client_id, client_secret, grant_type,
                 username=None, password=None):
        super(DataHub, self).__init__()
        self.base_url = 'https://datahub.csail.mit.edu'
        self.client_id = client_id
        self.client_secret = client_secret
        self.grant_type = grant_type
        self.username = username
        self.password = password
        self.access_token = None

    def refresh_access_token(self):
        if self.grant_type == 'password':
            self.access_token = self._token_for_password()

    def _token_for_password(self):
        token_url = '{}/oauth2/token/'.format(self.base_url)
        response = requests.post(token_url, data={
            'grant_type': 'password',
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'username': self.username,
            'password': self.password,
        })
        return response.json()['access_token']

    def query(self, repo_base, repo, query, response_format='json'):
        if not self.access_token:
            self.refresh_access_token()
        url = '{}/api/v1/query/{}/{}'.format(self.base_url, repo_base, repo)
        headers = {
            'Authorization': 'Bearer {}'.format(self.access_token)
        }
        response = requests.post(url, headers=headers, data={
            'query': query,
            'format': response_format,
        })
        return response.json()
