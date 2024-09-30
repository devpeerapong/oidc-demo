Authorization Code Flow with PKCE

1. GET /authorize?response_type=code
   1.1 Interaction.upsert(id, payload, expiresIn)
   1.2 Redirect to /interaction/${id}
   1.3 Set-Cookie \_interaction.sig=??, \_interaction=id

2. GET /interaction/{id}
   2.1 Interaction.find(id)
   2.2 show UI

3 POST /interaction/${id} FormData (prompt=login, login, password) 
3.1 Redirect /authorize/${id}

4. GET /authroize/${id}
4.1 Interaction.find(id)
4.2 Interaction.destroy(id)
4.3 Interaction.upsert(newId)
4.4 Session.upsert(sessionId)
4.5 Redirect to /interaction/${id}

5. GET /interaction/{id}
   5.1 Interaction.find(id)
   5.2 Session.findByUid(uid)

6. POST /interaction/{id} FormData (prompt=consent)
   6.1 Grant.upsert(grantId, payload, expiresIn)
   6.2 Interaction.find(id)
   6.3 Session.findByUid(uid)
   6.4 Interaction.upsert(id)

7. GET /authorize/{id}
   7.1 Session.find
   7.2 Interaction.find
   7.3 Interaction.destroy
   7.4 Grant.find
   7.5 AuthorizationCode.upsert
   7.6 Session.destroy
   7.7 Session.upsert

8. POST /token
   8.1 AuthrorizationCode.find
   8.2 Session.findByUid
   8.3 Grant.find
   8.4 AuthorizationCode.consume
   8.5 AccessToken.upsert

Log Out
GET /session/end

Session.find
Session.upsert

POST /session/end/confirm
Session.find
AccessToken.revokeByGrantId
RefreshToken.revokeByGrantId
AuthorizationToken.revokeByGrantId
AuthorizationCode.revokeByGrantId
Grant.destroy
Session.upsert
