import json
import base64
from cryptography.hazmat.primitives import serialization

# Load service account key
with open('service-account-key.json', 'r') as f:
    sa_key = json.load(f)

# Extract private key
private_key_pem = sa_key['private_key'].encode()

# Load private key
private_key = serialization.load_pem_private_key(
    private_key_pem,
    password=None
)

# Convert to JWK format
private_numbers = private_key.private_numbers()

# Create JWK
jwk = {
    'kty': 'RSA',
    'n': base64.urlsafe_b64encode(private_numbers.public_numbers.n.to_bytes((private_numbers.public_numbers.n.bit_length() + 7) // 8, 'big')).decode().rstrip('='),
    'e': base64.urlsafe_b64encode(private_numbers.public_numbers.e.to_bytes((private_numbers.public_numbers.e.bit_length() + 7) // 8, 'big')).decode().rstrip('='),
    'd': base64.urlsafe_b64encode(private_numbers.d.to_bytes((private_numbers.d.bit_length() + 7) // 8, 'big')).decode().rstrip('='),
    'p': base64.urlsafe_b64encode(private_numbers.p.to_bytes((private_numbers.p.bit_length() + 7) // 8, 'big')).decode().rstrip('='),
    'q': base64.urlsafe_b64encode(private_numbers.q.to_bytes((private_numbers.q.bit_length() + 7) // 8, 'big')).decode().rstrip('='),
    'dp': base64.urlsafe_b64encode(private_numbers.dmp1.to_bytes((private_numbers.dmp1.bit_length() + 7) // 8, 'big')).decode().rstrip('='),
    'dq': base64.urlsafe_b64encode(private_numbers.dmq1.to_bytes((private_numbers.dmq1.bit_length() + 7) // 8, 'big')).decode().rstrip('='),
    'qi': base64.urlsafe_b64encode(private_numbers.iqmp.to_bytes((private_numbers.iqmp.bit_length() + 7) // 8, 'big')).decode().rstrip('=')
}

print(json.dumps(jwk, indent=2))
