import React from "react";
/* eslint-disable no-unused-vars */
import { StyleSheet, FlatList, View, ActivityIndicator } from "react-native";

// STEEM
import { getPosts } from "../../providers/steem/Dsteem";

// LIBRARIES
import Placeholder from "rn-placeholder";

// COMPONENTS
import PostCard from "../../components/post-card/PostCard";

// SCREENS
import PostPage from "../../screens/single-post/Post";
/* eslint-enable no-unused-vars */

class TrendingPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isReady: false,
            posts: [],
            user: [],
            start_author: "",
            start_permlink: "",
            refreshing: false,
            loading: false,
            isLoggedIn: this.props.isLoggedIn,
        };
    }

    componentDidMount() {
        this.getTrending();
    }

    getTrending = () => {
        getPosts("trending", { tag: "", limit: 10 })
            .then(result => {
                this.setState({
                    isReady: true,
                    posts: result,
                    start_author: result[result.length - 1].author,
                    start_permlink: result[result.length - 1].permlink,
                    refreshing: false,
                });
            })
            .catch(err => {
                alert(err);
            });
    };

    getMore = () => {
        this.setState({ loading: true });
        getPosts("trending", {
            tag: "",
            limit: 10,
            start_author: this.state.start_author,
            start_permlink: this.state.start_permlink,
        }).then(result => {
            let posts = result;
            posts.shift();
            this.setState({
                posts: [...this.state.posts, ...posts],
                start_author: result[result.length - 1].author,
                start_permlink: result[result.length - 1].permlink,
            });
        });
    };

    refreshData = () => {
        this.setState(
            {
                refreshing: true,
            },
            () => {
                this.getTrending();
            }
        );
    };

    renderFooter = () => {
        if (!this.state.loading) return null;

        return (
            <View
                style={{
                    alignContent: "center",
                    alignItems: "center",
                    marginTop: 10,
                    marginBottom: 40,
                    borderColor: "#CED0CE",
                }}
            >
                <ActivityIndicator animating size="large" />
            </View>
        );
    };

    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.state.isReady ? (
                    <FlatList
                        data={this.state.posts}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <PostCard
                                navigation={this.props.navigation}
                                content={item}
                                user={this.props.user}
                                isLoggedIn={this.state.isLoggedIn}
                            />
                        )}
                        keyExtractor={(post, index) => index.toString()}
                        onEndReached={this.getMore}
                        refreshing={this.state.refreshing}
                        onRefresh={() => this.refreshData()}
                        onEndThreshold={0}
                        ListFooterComponent={this.renderFooter}
                    />
                ) : (
                    <View>
                        <View style={styles.placeholder}>
                            <Placeholder.ImageContent
                                size={60}
                                animate="fade"
                                lineNumber={4}
                                lineSpacing={5}
                                lastLineWidth="30%"
                                onReady={this.state.isReady}
                            />
                        </View>
                        <View style={styles.placeholder}>
                            <Placeholder.ImageContent
                                size={60}
                                animate="fade"
                                lineNumber={4}
                                lineSpacing={5}
                                lastLineWidth="30%"
                                onReady={this.state.isReady}
                            />
                        </View>
                        <View style={styles.placeholder}>
                            <Placeholder.ImageContent
                                size={60}
                                animate="fade"
                                lineNumber={4}
                                lineSpacing={5}
                                lastLineWidth="30%"
                                onReady={this.state.isReady}
                            />
                        </View>
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F9F9F9",
        flex: 1,
    },
    placeholder: {
        backgroundColor: "white",
        padding: 20,
        borderStyle: "solid",
        borderWidth: 1,
        borderTopWidth: 1,
        borderColor: "#e2e5e8",
        borderRadius: 5,
        marginRight: 0,
        marginLeft: 0,
        marginTop: 10,
    },
});

export default TrendingPage;
