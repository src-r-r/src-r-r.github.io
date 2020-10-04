
const GITHUB_URL = "https://github.com/src-r-r.atom";

async function corsGet(url) {
    axios.get(url, {
        headers: {
        }
    })
}

async function fetchAtomFeed(url, id) {
    let feed = {};
    let resp = await axios.get(url);
    console.log(`Fetch ${url}`)
    let doc = $.parseXML(resp.data);
    return doc;
}

angular.module('SrcRrBlog', [])

    .factory("doFetchFeed", ["$url", async function ($url) {
        return async function ($url) {
            // let doc = await fetchAtomFeed($url);
            // return Array.from(doc.childNodes[0].childNodes).filter(i => i.tagName);
            return ["a", "b", "c"];
        }
    }])
    .controller("FeedController", ["$scope", "doFetchFeed", async function ($scope, doFetchFeed) {
        console.log("here");
        $scope.resolvedItems = [];
        $scope.fetchFeed = async function (url) {
            $scope.resolvedItems = await doFetchFeed(url);
        }
    }])
    
    ;