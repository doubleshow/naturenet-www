(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('dataservice', dataservice);

  /* Dataservice
     ======================================================================== */

  dataservice.$inject = [
    '$q',
    '$firebaseObject',
    '$firebaseArray',
    '$firebaseAuth',
    '$firebaseRef',
    '$filter',
    'FilteredArray',
    'exception',
    'logger',
  ];
  /* @ngInject */
  function dataservice(
    $q,
    $firebaseObject,
    $firebaseArray,
    $firebaseAuth,
    $firebaseRef,
    $filter,
    FilteredArray,
    exception,
    logger) {

    var service = {
      // Utility functions
      getArray: getArray,
      deleteContent: deleteContent,

      // Authentication functions
      onAuthStateChanged: onAuthStateChanged,
      getAuth: getAuth,
      authWithPassword: authWithPassword,
      unAuth: unAuth,
      createUser: createUser,
      addUser: addUser,
      updateUser: updateUser,
      resetPassword: resetPassword,
      getActiveUserDetails: getActiveUserDetails,

      // User functions
      getUsers: getUsers,
      getUsersRecent: getUsersRecent,
      getActiveUser: getActiveUser,

      // Group functions
      getGroups: getGroups,
      getGroupById: getGroupById,
      getGroupsByUserId: getGroupsByUserId,

      // Site functions
      getSiteById: getSiteById,

      // Observation functions
      getObservationsByUserId: getObservationsByUserId,
      getObservationsByProjectId: getObservationsByProjectId,

      // Project functions
      getProjects: getProjects,
      getProjectsRecent: getProjectsRecent,
      getProjectById: getProjectById,
      getProjectsAtSite: getProjectsAtSite,

      // Idea functions
      addIdea: addIdea,

      // Feedback functions
      likeContent: likeContent,
      addComment: addComment,

      getCommentsRecent: getCommentsRecent,
      getCommentsForRecord: getCommentsForRecord,
      getCommentsByUserId: getCommentsByUserId,
    };

    return service;

    /* Utility functions
       ================================================== */

    function getArray(s) {
      var ref = $firebaseRef.default.child(s)
        .orderByChild('updated_at')
        .limitToLast(50);
      var data = notDeletedArray(ref);

      return data.$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load data for ' + s)(e);
      }
    }

    function notDeletedArray(ref) {
      return new FilteredArray(ref, function (item) {
        return !(item.hasOwnProperty('status') && item.status.toLowerCase() === 'deleted');
      });
    }

    function timestamp(data) {
      data.updated_at = firebase.database.ServerValue.TIMESTAMP;

      if (!data.hasOwnProperty('created_at')) {
        data.created_at = firebase.database.ServerValue.TIMESTAMP;
      }

      return data;
    }

    function deleteContent(context, id) {
      var d = $q.defer();

      return $firebaseRef.default
        .child(context).child(id).child('status')
        .setValue('deleted', function (error) {
          if (error) {
            fail(error);
          } else {
            success();
          }
        });

      return d.promise;

      function success(response) {
        d.resolve('success');
      }

      function fail(e) {
        d.reject(exception.catcher('Unable to delete this item')(e));
      }
    }

    /* Authentication functions
       ================================================== */

    function onAuthStateChanged(callback) {
      return firebase.auth().onAuthStateChanged(callback);
    }

    function getAuth() {
      return firebase.auth().currentUser;
    }

    function authWithPassword(email, password) {
      var auth = $firebaseAuth(firebase.auth());

      return auth.$signInWithEmailAndPassword(email, password)
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(error) {
        switch (error.code) {
          case 'auth/invalid-email':
            return exception.catcher('The email address is not valid.')(error);
          case 'auth/user-disabled':
            return exception.catcher('This account has been disabled.')(error);
          case 'auth/user-not-found':
            return exception.catcher('There is no user account for this email address.\n' +
              'Join NatureNet to get started.')(error);
          case 'auth/wrong-password':
            return exception.catcher('The email address or password is incorrect.\n' +
              'If you forgot your password, click "Reset my password."')(error);
          default:
            return exception.catcher('Unable to sign in.')(error);
        }
      }
    }

    function unAuth() {
      var auth = $firebaseAuth(firebase.auth());
      return auth.$signOut();
    }

    function createUser(email, password) {
      var auth = $firebaseAuth(firebase.auth());
      return auth.$createUserWithEmailAndPassword(email, password)
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(error) {
        switch (error.code) {
          case 'auth/invalid-email':
            return exception.catcher('The email address is not valid.')(error);
          case 'auth/email-already-in-use':
            return exception.catcher('This email address is already in use.\n' +
              'Sign in to access your account.')(error);
          case 'auth/weak-password':
            return exception.catcher('Please choose a password that is at least 6 characters long.')(error);
          default:
            return exception.catcher('Unable to join with email and password.')(error);
        }
      }
    }

    function addUser(profile) {
      var d = $q.defer();

      // Create the data we want to update
      var uid = profile.uid;
      var newUserData = {};
      newUserData['users-private/' + uid] = timestamp({
        id: uid,
        name: profile.name || '',
      });
      newUserData['users/' + uid] = timestamp({
        id: uid,
        avatar: profile.avatar || '',
        display_name: profile.display_name || '',
        affiliation: profile.affiliation || '',
        bio: profile.bio || '',
      });

      $firebaseRef.default.update(newUserData, function (error) {
        if (error) {
          fail(error);
        } else {
          success();
        }
      });

      return d.promise;

      function success(response) {
        d.resolve('success');
      }

      function fail(e) {
        d.reject(exception.catcher('Unable to create user profile!')(e));
      }
    }

    function updateUser(profile) {
      var d = $q.defer();

      // Create the data we want to update
      var uid = profile.uid;
      var updatedUserData = {};

      updatedUserData['users-private/' + uid + '/id'] = uid;
      updatedUserData['users-private/' + uid + '/name'] = profile.name || '';
      updatedUserData['users-private/' + uid + '/demographics'] = profile.demographics || null;
      updatedUserData['users-private/' + uid + '/updated_at'] = firebase.database.ServerValue.TIMESTAMP;

      updatedUserData['users/' + uid + '/id'] = uid;
      updatedUserData['users/' + uid + '/avatar'] = profile.avatar || '';
      updatedUserData['users/' + uid + '/display_name'] = profile.display_name || '';
      updatedUserData['users/' + uid + '/affiliation'] = profile.affiliation || '';
      updatedUserData['users/' + uid + '/bio'] = profile.bio || '';
      updatedUserData['users/' + uid + '/groups'] = profile.groups || null;
      updatedUserData['users/' + uid + '/updated_at'] = firebase.database.ServerValue.TIMESTAMP;

      for (var g in profile.groups) {
        updatedUserData['groups/' + g + '/members/' + uid] = profile.groups[g] || null;
      }

      $firebaseRef.default.update(updatedUserData, function (error) {
        if (error) {
          fail(error);
        } else {
          success();
        }
      });

      return d.promise;

      function success(response) {
        d.resolve('success');
      }

      function fail(e) {
        d.reject(exception.catcher('Unable to update user profile!')(e));
      }
    }

    function resetPassword(email) {
      var auth = $firebaseAuth(firebase.auth());
      return auth.$sendPasswordResetEmail(email)
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        switch (error.code) {
          case 'auth/invalid-email':
            return exception.catcher('The email address is not valid.')(error);
          case 'auth/user-not-found':
            return exception.catcher('There is no user account for this email address.\n' +
              'Join NatureNet to get started.')(error);
          default:
            return exception.catcher('Unable to reset password.')(error);
        }
      }
    }

    /* User functions
       ================================================== */

    function getUsers() {

      return $firebaseObject($firebaseRef.users).$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load users')(e);
      }
    }

    function getUsersRecent(limit) {
      var ref = $firebaseRef.users
        .orderByChild('created_at')
        .limitToLast(limit);
      var data = notDeletedArray(ref);

      return data.$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load recent users')(e);
      }
    }

    function getActiveUser() {
      var auth = getAuth();

      if (auth === null || !auth.uid) {
        console.log('User is not signed in.');
        return $q.when(null);
      }

      var data = $firebaseObject($firebaseRef.users.child(auth.uid));

      return data.$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load your profile')(e);
      }
    }

    function getActiveUserDetails() {
      var auth = getAuth();

      if (auth === null || !auth.uid) {
        console.log('User is not signed in.');
        return $q.when(null);
      }

      var publicData = $firebaseObject($firebaseRef.users.child(auth.uid));
      var privateData = $firebaseObject($firebaseRef.usersPrivate.child(auth.uid));

      return $q.all([publicData.$loaded(), privateData.$loaded()])
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load your account data')(e);
      }
    }

    /* Group functions
       ================================================== */

    function getGroups() {

      return $firebaseObject($firebaseRef.groups).$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load groups')(e);
      }
    }

    function getGroupById(id) {

      if (!id) {
        console.log('ID does not exist');
        return $q.when(null);
      }

      return $firebaseObject($firebaseRef.groups.child(id)).$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load group')(e);
      }
    }

    function getGroupsByUserId(id) {

      if (!id) {
        console.log('ID does not exist');
        return $q.when(null);
      }

      var ref = $firebaseRef.groups
        .orderByChild('members/' + id)
        .equalTo(true);
      var data = $firebaseArray(ref);

      return data.$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load groups for user')(e);
      }
    }

    /* Site functions
       ================================================== */

    function getSiteById(id) {

      if (!id) {
        console.log('ID does not exist');
        return $q.when(null);
      }

      return $firebaseObject($firebaseRef.sites.child(id)).$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load site')(e);
      }
    }

    /* Observation functions
       ================================================== */

    function getObservationsByUserId(id) {

      if (!id) {
        console.log('ID does not exist');
        return $q.when(null);
      }

      var ref = $firebaseRef.observations
        .orderByChild('observer')
        .equalTo(id);
      var data = notDeletedArray(ref);

      return data.$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load obsevations for user')(e);
      }
    }

    function getObservationsByProjectId(id) {

      if (!id) {
        console.log('ID does not exist');
        return $q.when(null);
      }

      var ref = $firebaseRef.observations
        .orderByChild('activity')
        .equalTo(id);
      var data = notDeletedArray(ref);

      return data.$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load observations for project')(e);
      }
    }

    function getObservationsBySiteId(id) {

      if (!id) {
        console.log('ID does not exist');
        return $q.when(null);
      }

      var ref = $firebaseRef.observations
        .orderByChild('site')
        .equalTo(id);
      var data = notDeletedArray(ref);

      return data.$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load observations for site')(e);
      }
    }

    /* Project functions
       ================================================== */

    function getProjects() {

      return $firebaseObject($firebaseRef.projects).$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load projects')(e);
      }
    }

    function getProjectById(id) {

      if (!id) {
        console.log('ID does not exist');
        return $q.when(null);
      }

      return $firebaseObject($firebaseRef.projects.child(id)).$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load project')(e);
      }
    }

    function getProjectsRecent(limit) {
      var ref = $firebaseRef.projects
        .orderByChild('updated_at')
        .limitToLast(limit);
      var data = notDeletedArray(ref);

      return data.$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load recent projects')(e);
      }
    }

    function getProjectsAtSite(siteId) {
      var ref = $firebaseRef.projects
        .orderByChild('sites/' + siteId)
        .equalTo(true);
      var data = $firebaseArray(ref);

      return data.$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load projects for site')(e);
      }
    }

    /* Idea functions
       ================================================== */

    function addIdea(content, group, type) {
      var auth = getAuth();

      if (auth === null || !auth.uid) {
        console.log('You must be signed in to do that!');
        return $q.reject(null);
      }

      var id = $firebaseRef.ideas.push().key;

      var idea = timestamp({
        id: id,
        group: group,
        type: type,
        submitter: auth.uid,
        content: content,
        status: 'doing',
      });

      var newData = {};
      newData['ideas/' + id] = idea;
      newData['users/' + auth.uid + '/latest_contribution'] = firebase.database.ServerValue.TIMESTAMP;

      return $firebaseRef.default.update(newData).then(success).catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to submit design idea')(e);
      }
    }

    /* Feedback functions
       ================================================== */

    function likeContent(type, record, isPositive) {
      var auth = getAuth();

      if (auth === null || !auth.uid) {
        console.log('You must be signed in to do that!');
        return;
      }

      var uid = auth.uid;

      $firebaseObject($firebaseRef.default.child(type + '/' + record.$id + '/likes')).$loaded().then(function (likes) {
        if (likes[uid] === isPositive) {
          delete likes[uid];
        } else {
          likes[uid] = isPositive;
        }

        likes.$save();
      });

    }

    function addComment(context, record, text) {
      var auth = getAuth();

      if (auth === null || !auth.uid) {
        console.log('You must be signed in to do that!');
        return;
      }

      var id = $firebaseRef.comments.push().key;

      var newComment = timestamp({
        id: id,
        parent: record.$id,
        context: context,
        comment: text,
        commenter: auth.uid,
      });

      var newData = {};
      newData['comments/' + id] = newComment;
      newData[context + '/' + record.$id + '/comments/' + id] = true;

      $firebaseRef.default.update(newData);
    }

    function getCommentsRecent(limit) {
      var ref = $firebaseRef.comments
        .orderByChild('updated_at')
        .limitToLast(limit);
      var data = notDeletedArray(ref);

      return data.$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load recent comments')(e);
      }
    }

    function getCommentsByUserId(id) {

      if (!id) {
        console.log('ID does not exist');
        return $q.when(null);
      }

      var ref = $firebaseRef.comments
        .orderByChild('commenter')
        .equalTo(id);
      var data = notDeletedArray(ref);

      return data.$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load comments for user')(e);
      }
    }

    function getCommentsForRecord(record) {
      var ref = $firebaseRef.comments
        .orderByChild('parent')
        .equalTo(record.$id || record.id);
      var data = notDeletedArray(ref);

      return data.$loaded()
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('Unable to load comments for this contribution')(e);
      }
    }
  }
})();
